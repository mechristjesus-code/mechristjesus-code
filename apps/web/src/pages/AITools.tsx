import { useState } from 'react';
import { 
  FileText, 
  Hash, 
  MessageSquare, 
  Youtube, 
  Wand2, 
  Send,
  Copy,
  Check
} from 'lucide-react';

const AITools = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const tools = [
    { name: 'Script Writer', icon: FileText, desc: 'Generate full video scripts' },
    { name: 'Title Gen', icon: Wand2, desc: 'Viral hooks and titles' },
    { name: 'Transcribe', icon: Youtube, desc: 'YouTube URL to text' },
    { name: 'Social Post', icon: Hash, desc: 'Threads and captions' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    // Mock generation
    setTimeout(() => {
      setResult("## AI Future: The Creator DNA Revolution\n\n**Hook:** In a world where AI is everywhere, how do you stand out? You use your DNA.\n\n**Introduction:** Content creation is changing. It's no longer about just 'generating' content; it's about 'curating' it through your unique lens.\n\n**Key Point 1:** AI can write, but it can't feel. Your Creator DNA is the bridge between raw compute and human emotion.\n\n**Conclusion:** Don't just use AI. Train it to be you.");
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">AI Studio</h2>
        <p className="text-slate-400 mt-2">Powerful AI tools personalized with your Creator DNA.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tool Selector */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Select Tool</h3>
          <div className="grid grid-cols-1 gap-3">
            {tools.map((tool) => (
              <button
                key={tool.name}
                className="flex items-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500 transition-all group text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center mr-4 group-hover:bg-blue-600/20 transition-colors">
                  <tool.icon className="h-5 w-5 text-slate-400 group-hover:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">{tool.name}</p>
                  <p className="text-xs text-slate-500">{tool.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input/Output Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2 text-sm text-blue-400 font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Personalized with "Professional & Informative" DNA</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create..."
                className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                    <Youtube className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                    <MessageSquare className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2 rounded-lg font-semibold flex items-center transition-all"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Result Area */}
            {result && (
              <div className="border-t border-slate-800 p-6 bg-slate-900/80">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-300">Generated Output</h4>
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4 mr-1 text-emerald-400" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
                <div className="prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-wrap">
                  {result}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITools;
