import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

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
}
