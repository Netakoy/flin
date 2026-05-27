import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Пользователи
  const stas = await prisma.user.upsert({
    where: { id: 'user-stas' },
    update: {},
    create: { id: 'user-stas', name: 'Стас', role: 'admin', avatarColor: '#16a34a' },
  });
  const lyuba = await prisma.user.upsert({
    where: { id: 'user-lyuba' },
    update: {},
    create: { id: 'user-lyuba', name: 'Люба', role: 'member', avatarColor: '#db2777' },
  });

  // Категории расходов
  const cats = await Promise.all([
    prisma.category.upsert({ where: { id: 'cat-products' }, update: {}, create: { id: 'cat-products', name: 'Продукты', type: 'expense', emoji: '🛒', color: '#16a34a' } }),
    prisma.category.upsert({ where: { id: 'cat-cafe' }, update: {}, create: { id: 'cat-cafe', name: 'Кафе', type: 'expense', emoji: '☕', color: '#d97706' } }),
    prisma.category.upsert({ where: { id: 'cat-taxi' }, update: {}, create: { id: 'cat-taxi', name: 'Такси', type: 'expense', emoji: '🚕', color: '#7c3aed' } }),
    prisma.category.upsert({ where: { id: 'cat-kids' }, update: {}, create: { id: 'cat-kids', name: 'Дети', type: 'expense', emoji: '🏫', color: '#2563eb' } }),
    prisma.category.upsert({ where: { id: 'cat-health' }, update: {}, create: { id: 'cat-health', name: 'Здоровье', type: 'expense', emoji: '💊', color: '#dc2626' } }),
    prisma.category.upsert({ where: { id: 'cat-home' }, update: {}, create: { id: 'cat-home', name: 'Дом', type: 'expense', emoji: '🏠', color: '#0891b2' } }),
    prisma.category.upsert({ where: { id: 'cat-clothes' }, update: {}, create: { id: 'cat-clothes', name: 'Одежда', type: 'expense', emoji: '👗', color: '#9333ea' } }),
    prisma.category.upsert({ where: { id: 'cat-entertainment' }, update: {}, create: { id: 'cat-entertainment', name: 'Развлечения', type: 'expense', emoji: '🎬', color: '#ea580c' } }),
    prisma.category.upsert({ where: { id: 'cat-transport' }, update: {}, create: { id: 'cat-transport', name: 'Транспорт', type: 'expense', emoji: '🚌', color: '#0369a1' } }),
    prisma.category.upsert({ where: { id: 'cat-mortgage' }, update: {}, create: { id: 'cat-mortgage', name: 'Ипотека', type: 'expense', emoji: '🏦', color: '#374151' } }),
    prisma.category.upsert({ where: { id: 'cat-internet' }, update: {}, create: { id: 'cat-internet', name: 'Интернет', type: 'expense', emoji: '📶', color: '#6366f1' } }),
    prisma.category.upsert({ where: { id: 'cat-other-exp' }, update: {}, create: { id: 'cat-other-exp', name: 'Другое', type: 'expense', emoji: '📦', color: '#6b7280' } }),
    // Категории доходов
    prisma.category.upsert({ where: { id: 'cat-salary' }, update: {}, create: { id: 'cat-salary', name: 'Зарплата', type: 'income', emoji: '💰', color: '#16a34a' } }),
    prisma.category.upsert({ where: { id: 'cat-other-inc' }, update: {}, create: { id: 'cat-other-inc', name: 'Другое', type: 'income', emoji: '📥', color: '#6b7280' } }),
  ]);

  // Бюджетный период (1–31 мая 2026)
  await prisma.budgetPeriod.upsert({
    where: { id: 'period-may-2026' },
    update: {},
    create: {
      id: 'period-may-2026',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-31'),
      plannedBudget: 100000,
      startingBalance: 100000,
      includeRecurringInBudget: false,
    },
  });

  // Регулярные платежи
  await prisma.recurringPayment.upsert({ where: { id: 'rec-mortgage' }, update: {}, create: { id: 'rec-mortgage', name: 'Ипотека', amount: 45000, categoryId: 'cat-mortgage', dayOfMonth: 15, frequency: 'monthly', isActive: true } });
  await prisma.recurringPayment.upsert({ where: { id: 'rec-internet' }, update: {}, create: { id: 'rec-internet', name: 'Интернет', amount: 900, categoryId: 'cat-internet', dayOfMonth: 20, frequency: 'monthly', isActive: true } });
  await prisma.recurringPayment.upsert({ where: { id: 'rec-kids' }, update: {}, create: { id: 'rec-kids', name: 'Детсад', amount: 15000, categoryId: 'cat-kids', dayOfMonth: 5, frequency: 'monthly', isActive: true } });

  // Запланированные расходы
  await prisma.plannedExpense.upsert({ where: { id: 'plan-bed' }, update: {}, create: { id: 'plan-bed', name: 'Кровать', estimatedAmount: 40000, categoryId: 'cat-home', priority: 'high', necessity: 'optional', status: 'planned' } });
  await prisma.plannedExpense.upsert({ where: { id: 'plan-appliances' }, update: {}, create: { id: 'plan-appliances', name: 'Бытовая техника', estimatedAmount: 25000, categoryId: 'cat-home', priority: 'medium', necessity: 'optional', status: 'planned' } });

  // Тестовые транзакции
  const today = new Date();
  await prisma.transaction.createMany({
    skipDuplicates: true,
    data: [
      { id: 'tx-1', type: 'expense', amount: 2500, description: 'Продукты', categoryId: 'cat-products', userId: 'user-lyuba', date: today, source: 'manual' },
      { id: 'tx-2', type: 'expense', amount: 300, description: 'Кофе', categoryId: 'cat-cafe', userId: 'user-stas', date: today, source: 'manual' },
      { id: 'tx-3', type: 'expense', amount: 1200, description: 'Такси', categoryId: 'cat-taxi', userId: 'user-stas', date: today, source: 'manual' },
      { id: 'tx-4', type: 'expense', amount: 540, description: 'Аптека', categoryId: 'cat-health', userId: 'user-lyuba', date: today, source: 'manual' },
    ],
  });

  console.log('✅ Seed complete. Users: Стас, Люба. Period: май 2026.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
