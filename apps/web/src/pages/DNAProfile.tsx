import { Save, User, MessageSquare, Zap, Palette } from 'lucide-react';

const DNAProfile = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Creator DNA</h2>
          <p className="text-slate-400 mt-2">Fine-tune how the AI learns and generates content for you.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold flex items-center transition-colors">
          <Save className="mr-2 h-5 w-5" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="space-y-2">
          {[
            { name: 'General', icon: User, active: true },
            { name: 'Writing Style', icon: MessageSquare, active: false },
            { name: 'Brand Settings', icon: Palette, active: false },
            { name: 'AI Workflows', icon: Zap, active: false },
          ].map((tab) => (
            <button
              key={tab.name}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                tab.active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <tab.icon className="mr-3 h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-slate-800 pb-2">Writing Preferences</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Tone of Voice</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Professional & Informative</option>
                    <option>Casual & Friendly</option>
                    <option>Witty & Sarcastic</option>
                    <option>Inspirational & Bold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Target Audience</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Tech-savvy Gen Z, C-suite Executives"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-slate-800 pb-2">Prompt Templates</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-blue-400">YouTube Script Base</span>
                    <button className="text-xs text-slate-500 hover:text-slate-300">Edit</button>
                  </div>
                  <p className="text-sm text-slate-400 italic">"Start with a high-energy hook, follow with a problem-solution framework..."</p>
                </div>
                <button className="w-full border-2 border-dashed border-slate-700 rounded-xl p-4 text-sm text-slate-500 hover:border-slate-500 hover:text-slate-300 transition-colors">
                  + Add New Template
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-slate-800 pb-2">Brand Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded bg-blue-600 border border-slate-700"></div>
                    <input type="text" value="#2563EB" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" readOnly />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Keywords to Avoid</label>
                  <input type="text" placeholder="e.g. revolutionary, game-changer" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DNAProfile;
