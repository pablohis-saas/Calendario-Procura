import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAllHistorialCobros = async (req: Request, res: Response): Promise<void> => {
    try {
        const historial = await prisma.historialCobro.findMany({
            include: {
                cobro: true,
                usuario: true,
            },
        });
        res.json(historial);
    } catch (error) {
        console.error('Error getting all historial cobros:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
};

export const getHistorialCobroById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const registro = await prisma.historialCobro.findUnique({
            where: { id },
            include: {
                cobro: true,
                usuario: true,
            },
        });
        
        if (!registro) {
            res.status(404).json({ error: 'Registro de historial no encontrado' });
            return;
        }
        
        res.json(registro);
    } catch (error) {
        console.error('Error getting historial cobro by id:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
};

export const createHistorialCobro = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cobro_id, usuario_id, tipo_cambio, detalles_antes, detalles_despues } = req.body;
        
        if (!cobro_id || !usuario_id || !tipo_cambio || !detalles_despues) {
            res.status(400).json({ error: 'Faltan campos requeridos' });
            return;
        }
        
        const cobro = await prisma.cobro.findUnique({ where: { id: cobro_id } });
        if (!cobro) {
            res.status(400).json({ error: 'El cobro especificado no existe' });
            return;
        }
        
        const usuario = await prisma.usuario.findUnique({ where: { id: usuario_id } });
        if (!usuario) {
            res.status(400).json({ error: 'El usuario especificado no existe' });
            return;
        }
        
        const tiposValidos = ['CREACION', 'EDICION', 'ELIMINACION', 'ACTUALIZACION'];
        if (!tiposValidos.includes(tipo_cambio)) {
            res.status(400).json({ error: 'Tipo de cambio inválido' });
            return;
        }
        
        const registro = await prisma.historialCobro.create({
            data: {
                cobro_id,
                usuario_id,
                tipo_cambio,
                detalles_antes: detalles_antes || {},
                detalles_despues,
            },
        });
        
        res.status(200).json(registro);
    } catch (error) {
        console.error('Error creating historial cobro:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Error al crear historial cobro' });
    }
};

export const updateHistorialCobro = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { cobro_id, usuario_id, tipo_cambio, detalles_antes, detalles_despues } = req.body;
        
        const updateData: any = {};
        
        if (cobro_id) {
            const cobro = await prisma.cobro.findUnique({ where: { id: cobro_id } });
            if (!cobro) {
                res.status(400).json({ error: 'El cobro especificado no existe' });
                return;
            }
            updateData.cobro_id = cobro_id;
        }
        
        if (usuario_id) {
            const usuario = await prisma.usuario.findUnique({ where: { id: usuario_id } });
            if (!usuario) {
                res.status(400).json({ error: 'El usuario especificado no existe' });
                return;
            }
            updateData.usuario_id = usuario_id;
        }
        
        if (tipo_cambio) {
            const tiposValidos = ['CREACION', 'EDICION', 'ELIMINACION', 'ACTUALIZACION'];
            if (!tiposValidos.includes(tipo_cambio)) {
                res.status(400).json({ error: 'Tipo de cambio inválido' });
                return;
            }
            updateData.tipo_cambio = tipo_cambio;
        }
        
        if (detalles_antes !== undefined) {
            updateData.detalles_antes = detalles_antes;
        }
        
        if (detalles_despues !== undefined) {
            updateData.detalles_despues = detalles_despues;
        }
        
        const registro = await prisma.historialCobro.update({
            where: { id },
            data: updateData,
        });
        
        res.status(200).json(registro);
    } catch (error) {
        console.error('Error updating historial cobro:', error);
        res.status(404).json({ error: 'Registro de historial no encontrado' });
    }
};

export const deleteHistorialCobro = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        await prisma.historialCobro.delete({ where: { id } });
        
        res.status(200).json({ message: 'HistorialCobro eliminado' });
    } catch (error) {
        console.error('Error deleting historial cobro:', error);
        res.status(404).json({ error: 'Registro de historial no encontrado' });
    }
}; 