import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAllCobroConceptos = async (req: Request, res: Response): Promise<void> => {
    try {
        const conceptos = await prisma.cobroConcepto.findMany({
            include: {
                cobro: true,
                consultorio: true,
            },
        });
        res.json(conceptos);
    } catch (error) {
        console.error('Error getting all cobro conceptos:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
};

export const getCobroConceptoById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const concepto = await prisma.cobroConcepto.findUnique({
            where: { id },
            include: {
                cobro: true,
                consultorio: true,
            },
        });
        
        if (!concepto) {
            res.status(404).json({ error: 'CobroConcepto no encontrado' });
            return;
        }
        
        res.json(concepto);
    } catch (error) {
        console.error('Error getting cobro concepto by id:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
};

export const createCobroConcepto = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cobro_id, servicio_id, precio_unitario, cantidad, subtotal, consultorio_id } = req.body;
        
        if (!cobro_id || !servicio_id || !precio_unitario || !cantidad || !subtotal || !consultorio_id) {
            res.status(400).json({ error: 'Faltan campos requeridos' });
            return;
        }
        
        const cobro = await prisma.cobro.findUnique({ where: { id: cobro_id } });
        if (!cobro) {
            res.status(400).json({ error: 'El cobro especificado no existe' });
            return;
        }
        
        const consultorio = await prisma.consultorio.findUnique({ where: { id: consultorio_id } });
        if (!consultorio) {
            res.status(400).json({ error: 'El consultorio especificado no existe' });
            return;
        }
        
        const servicio = await prisma.servicio.findUnique({ where: { id: servicio_id } });
        if (!servicio) {
            res.status(400).json({ error: 'El servicio especificado no existe' });
            return;
        }
        
        const concepto = await prisma.cobroConcepto.create({
            data: {
                cobro_id,
                servicio_id,
                precio_unitario: parseFloat(precio_unitario),
                cantidad: parseInt(cantidad),
                subtotal: parseFloat(subtotal),
                consultorio_id,
            },
        });
        
        res.status(200).json(concepto);
    } catch (error) {
        console.error('Error creating cobro concepto:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Error al crear cobro concepto' });
    }
};

export const updateCobroConcepto = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { cobro_id, servicio_id, precio_unitario, cantidad, subtotal, consultorio_id } = req.body;
        
        const updateData: any = {};
        
        if (cobro_id) {
            const cobro = await prisma.cobro.findUnique({ where: { id: cobro_id } });
            if (!cobro) {
                res.status(400).json({ error: 'El cobro especificado no existe' });
                return;
            }
            updateData.cobro_id = cobro_id;
        }
        
        if (servicio_id) {
            const servicio = await prisma.servicio.findUnique({ where: { id: servicio_id } });
            if (!servicio) {
                res.status(400).json({ error: 'El servicio especificado no existe' });
                return;
            }
            updateData.servicio_id = servicio_id;
        }
        
        if (precio_unitario) {
            updateData.precio_unitario = parseFloat(precio_unitario);
        }
        
        if (cantidad) {
            updateData.cantidad = parseInt(cantidad);
        }
        
        if (subtotal) {
            updateData.subtotal = parseFloat(subtotal);
        }
        
        if (consultorio_id) {
            const consultorio = await prisma.consultorio.findUnique({ where: { id: consultorio_id } });
            if (!consultorio) {
                res.status(400).json({ error: 'El consultorio especificado no existe' });
                return;
            }
            updateData.consultorio_id = consultorio_id;
        }
        
        const concepto = await prisma.cobroConcepto.update({
            where: { id },
            data: updateData,
        });
        
        res.json(concepto);
    } catch (error) {
        console.error('Error updating cobro concepto:', error);
        res.status(404).json({ error: 'CobroConcepto no encontrado' });
    }
};

export const deleteCobroConcepto = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        await prisma.cobroConcepto.delete({ where: { id } });
        
        res.json({ message: 'CobroConcepto eliminado' });
    } catch (error) {
        console.error('Error deleting cobro concepto:', error);
        res.status(404).json({ error: 'CobroConcepto no encontrado' });
    }
}; 