import { prisma } from '@/lib/prisma';
import { selectUser } from '@/actions/user';

export default async function SelectUserPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black text-green-700 tracking-widest text-center mb-2">
          ФЛИН
        </h1>
        <p className="text-center text-slate-500 text-sm mb-10">
          Семейный бюджет
        </p>

        <p className="text-slate-600 text-center mb-6 font-medium">Кто ты?</p>

        <div className="flex flex-col gap-4">
          {users.map((user) => (
            <form key={user.id} action={selectUser.bind(null, user.id)}>
              <button
                type="submit"
                className="w-full bg-white border-2 border-green-200 rounded-2xl p-5 text-left hover:border-green-500 hover:bg-green-50 transition-all active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                    style={{ backgroundColor: user.avatarColor ?? '#16a34a' }}
                  >
                    {user.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg">{user.name}</div>
                    <div className="text-slate-400 text-sm">
                      {user.role === 'admin' ? 'Администратор' : 'Участник'}
                    </div>
                  </div>
                </div>
              </button>
            </form>
          ))}
        </div>
      </div>
    </main>
  );
}
