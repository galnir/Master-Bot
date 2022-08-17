import { PrismaClient } from '@prisma/client';

export default new PrismaClient({ errorFormat: 'minimal' });
