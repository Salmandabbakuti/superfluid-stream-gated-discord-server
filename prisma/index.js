const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['warn', 'error']
});

prisma.$connect()
  .then(() => console.log('Database has been connected'))
  .catch((err) => console.log('Unable to connect database', err));

module.exports = prisma;