import { Search, Plus, Filter, MoreVertical, FileText, Youtube, Hash } from 'lucide-react';

const Projects = () => {
  const projects = [
    { id: 1, title: 'AI Trends 2026', type: 'YouTube Script', date: 'Jul 2, 2026', status: 'Draft' },
    { id: 2, title: 'Productivity Hacks', type: 'Twitter Thread', date: 'Jun 30, 2026', status: 'Completed' },
    { id: 3, title: 'Newsletter #42', type: 'Blog Post', date: 'Jun 28, 2026', status: 'Completed' },
    { id: 4, title: 'Future of SaaS', type: 'YouTube Script', date: 'Jun 25, 2026', status: 'Draft' },
  ];

  const getTypeIcon = (type: string) => {
    if (type.includes('YouTube')) return <Youtube className="h-4 w-4 text-red-400" />;
    if (type.includes('Twitter')) return <Hash className="h-4 w-4 text-blue-400" />;
    return <FileText className="h-4 w-4 text-emerald-400" />;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Projects</h2>
          <p className="text-slate-400 mt-1">Manage and organize your AI-generated content.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center transition-all shadow-lg shadow-blue-600/20">
          <Plus className="mr-2 h-5 w-5" />
          New Project
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <Filter className="mr-2 h-5 w-5" />
          Filter
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                {getTypeIcon(project.type)}
              </div>
              <button className="text-slate-500 hover:text-white">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
            <h3 className="text-lg font-bold mb-1">{project.title}</h3>
            <p className="text-sm text-slate-500 mb-6">{project.type}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
              <span className="text-xs text-slate-500">{project.date}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
        ))}
        
        {/* Empty State / Add New */}
        <button className="border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-slate-700 hover:text-slate-400 transition-all group">
          <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-medium">Create New</span>
        </button>
      </div>
    </div>
  );
};

export default Projects;
