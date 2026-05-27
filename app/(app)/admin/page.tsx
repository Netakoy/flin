import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { updateBudgetPeriod } from '@/actions/budget';
import { switchUser } from '@/actions/user';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const period = await prisma.budgetPeriod.findFirst({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="flex flex-col gap-4 p-4 pt-6">
      <h2 className="text-lg font-bold text-slate-800">Настройки</h2>

      {/* Сменить пользователя */}
      <div className="bg-white rounded-2xl border-2 border-slate-100 p-4">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">
          Текущий пользователь
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: user.avatarColor ?? '#16a34a' }}
            >
              {user.name[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-400">
                {user.role === 'admin' ? 'Администратор' : 'Участник'}
              </p>
            </div>
          </div>
          <form action={switchUser}>
            <Button type="submit" variant="outline" className="rounded-xl border-slate-200 text-sm">
              Сменить
            </Button>
          </form>
        </div>
      </div>

      {/* Бюджетный период — только для admin */}
      {user.role === 'admin' && period && (
        <div className="bg-white rounded-2xl border-2 border-slate-100 p-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">
            Бюджетный период
          </p>
          <form
            action={async (fd: FormData) => {
              'use server';
              await updateBudgetPeriod({
                id: period.id,
                startDate: fd.get('startDate') as string,
                endDate: fd.get('endDate') as string,
                plannedBudget: parseFloat(fd.get('plannedBudget') as string),
                startingBalance: parseFloat(fd.get('startingBalance') as string),
                includeRecurringInBudget: fd.get('includeRecurring') === 'on',
              });
            }}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">Начало</label>
                <Input
                  type="date"
                  name="startDate"
                  defaultValue={period.startDate.toISOString().split('T')[0]}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">Конец</label>
                <Input
                  type="date"
                  name="endDate"
                  defaultValue={period.endDate.toISOString().split('T')[0]}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1 block">Бюджет (₽)</label>
              <Input
                type="number"
                name="plannedBudget"
                defaultValue={period.plannedBudget}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1 block">
                Стартовый остаток (₽)
              </label>
              <Input
                type="number"
                name="startingBalance"
                defaultValue={period.startingBalance}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 rounded-xl h-11 font-semibold"
            >
              Сохранить
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
