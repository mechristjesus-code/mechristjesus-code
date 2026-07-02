import { Sparkles, FolderPlus, History, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { name: 'Total Projects', value: '12', icon: History, color: 'text-blue-400' },
    { name: 'AI Generations', value: '148', icon: Sparkles, color: 'text-emerald-400' },
    { name: 'DNA Score', value: '92%', icon: TrendingUp, color: 'text-purple-400' },
  ];

  const recentProjects = [
    { id: 1, title: 'YouTube Script: AI Future', date: '2 hours ago', status: 'Draft' },
    { id: 2, title: 'Twitter Thread: Productivity', date: 'Yesterday', status: 'Completed' },
    { id: 3, title: 'Blog Post: Web3 Guide', date: '3 days ago', status: 'Draft' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Welcome back, John</h2>
        <p className="text-slate-400 mt-2">Here's what's happening with your Creator DNA.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.name}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold">Recent Projects</h3>
            <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
          </div>
          <div className="divide-y divide-slate-800">
            {recentProjects.map((project) => (
              <div key={project.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <div>
                  <p className="font-medium">{project.title}</p>
                  <p className="text-sm text-slate-500">{project.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl relative overflow-hidden group cursor-pointer">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Start New Project</h3>
              <p className="text-blue-100/80 mb-6">Launch a new AI-powered creation with your DNA settings.</p>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold flex items-center">
                <FolderPlus className="mr-2 h-5 w-5" />
                Create Now
              </button>
            </div>
            <Sparkles className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform" />
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-semibold mb-4">DNA Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Writing Style Profile</span>
                  <span className="text-emerald-400">Active</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[85%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Brand Voice Alignment</span>
                  <span className="text-blue-400">92%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[92%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
