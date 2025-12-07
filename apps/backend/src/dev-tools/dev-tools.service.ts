import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

@Injectable()
export class DevToolsService {
    /**
     * Resetear la base de datos (SOLO PARA DESARROLLO)
     */
    async resetDatabase(): Promise<{ message: string; success: boolean }> {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Esta operación no está permitida en producción');
        }

        try {
            // Ejecutar prisma db push con force reset
            const { stdout, stderr } = await execAsync('npx prisma db push --force-reset --accept-data-loss', {
                cwd: process.cwd(),
            });

            console.log('Database reset output:', stdout);
            if (stderr) {
                console.error('Database reset stderr:', stderr);
            }

            return {
                success: true,
                message: 'Base de datos reseteada exitosamente',
            };
        } catch (error) {
            console.error('Error resetting database:', error);
            throw new Error('Error al resetear la base de datos: ' + error.message);
        }
    }
    /**
     * Respalda la base de datos generando un archivo SQL
     */
    async backupDatabase(): Promise<{ path: string; filename: string }> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        const outputPath = `/tmp/${filename}`;

        // Extraer credenciales de DATABASE_URL si es necesario, o confiar en el entorno
        // Asumimos que pg_dump está instalado y disponible en el PATH
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL no está definida');

        try {
            // Limpiar la URL de parámetros query que pg_dump no soporta (como ?schema=public)
            const cleanDbUrl = dbUrl.split('?')[0];

            // Usamos pg_dump con la URL de conexión limpia
            await execAsync(`pg_dump "${cleanDbUrl}" > "${outputPath}"`);

            return {
                path: outputPath,
                filename: filename
            };
        } catch (error) {
            console.error('Error durante el backup:', error);
            throw new Error('Error al generar el respaldo de la base de datos');
        }
    }

    /**
     * Restaura la base de datos desde un archivo SQL
     */
    async restoreDatabase(file: any): Promise<{ success: boolean; message: string }> {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL no está definida');

        let filePath = file.path;
        let tempCreated = false;

        try {
            // Si no hay path (memory storage), escribimos el buffer a un archivo temporal
            if (!filePath && file.buffer) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `restore-${timestamp}.sql`;
                filePath = join('/tmp', filename);
                await writeFile(filePath, file.buffer);
                tempCreated = true;
            }

            if (!filePath) {
                throw new Error('No se pudo determinar la ruta del archivo de respaldo');
            }

            // Limpiar la URL de parámetros query (ej. ?schema=public)
            const cleanDbUrl = dbUrl.split('?')[0];

            // Ejecutar el archivo SQL
            await execAsync(`psql "${cleanDbUrl}" < "${filePath}"`);

            return {
                success: true,
                message: 'Base de datos restaurada exitosamente'
            };
        } catch (error) {
            console.error('Error durante la restauración:', error);
            throw new Error('Error al restaurar la base de datos: ' + error.message);
        } finally {
            // Limpiar archivo temporal si fue creado por nosotros
            if (tempCreated && filePath) {
                try {
                    await unlink(filePath);
                } catch (e) {
                    console.error('Error eliminando archivo temporal:', e);
                }
            }
        }
    }
}
