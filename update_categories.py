import sys

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Fix imports
old_imports = "import { Search, MapPin, Mic, ArrowRight, Bookmark, Building2, Briefcase, DollarSign, List, Shield, User, Globe, Plus, ArrowUp, Smartphone, ShieldCheck } from 'lucide-react'"
new_imports = "import { Mic, ArrowRight, DollarSign, Shield, User, Globe, Plus, ArrowUp, ShieldCheck, ShieldAlert, Fingerprint, ShoppingCart, Cpu } from 'lucide-react'"
content = content.replace(old_imports, new_imports)

# 2. Fix filters
old_filters = """  const filters = hi 
    ? ['वित्तीय धोखाधड़ी', 'सोशल मीडिया हैकिंग', 'महिलाओं/बच्चों के अपराध', 'हेट स्पीच', 'ऑनलाइन रैगिंग', 'अन्य साइबर अपराध']
    : ['Financial Fraud', 'Social Media Hacking', 'Women/Children Crime', 'Hate Speech', 'Online Ragging', 'Other Cyber Crime']"""
new_filters = """  const filters = hi 
    ? ['वित्तीय धोखाधड़ी', 'महिला/बाल अपराध', 'जबरन वसूली (Extortion)', 'पहचान की चोरी', 'ई-कॉमर्स धोखाधड़ी', 'हैकिंग और मैलवेयर']
    : ['Financial Fraud', 'Women/Children Crime', 'Extortion & Blackmail', 'Identity Theft', 'E-Commerce Scams', 'Hacking & Malware']"""
content = content.replace(old_filters, new_filters)

# 3. Fix the array inside the render block
old_array_start = """          {[
            { 
              title: 'Financial Fraud', """

# Just replace the entire array block. We can use regex or string indexing.
start_idx = content.find("        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">\n          {[")
if start_idx != -1:
    end_idx = content.find("          ].map((cat, i) => (", start_idx)
    
    new_array = """        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              title: 'Financial Fraud', 
              titleHi: 'वित्तीय धोखाधड़ी',
              desc: 'Report UPI, banking, and credit card frauds.',
              descHi: 'UPI, बैंकिंग और क्रेडिट कार्ड धोखाधड़ी की रिपोर्ट करें।',
              bg: 'from-blue-500 to-cyan-400',
              icon: <DollarSign className="w-10 h-10 text-white/90" />
            },
            { 
              title: 'Women/Children Crime', 
              titleHi: 'महिला/बाल अपराध',
              desc: 'Report harassment, cyberbullying, and abuse.',
              descHi: 'उत्पीड़न, साइबरबुलिंग और दुर्व्यवहार की रिपोर्ट करें।',
              bg: 'from-pink-500 to-rose-400',
              icon: <User className="w-10 h-10 text-white/90" />
            },
            { 
              title: 'Extortion & Blackmail', 
              titleHi: 'जबरन वसूली (Extortion)',
              desc: 'Report digital loan apps, sextortion, and threats.',
              descHi: 'डिजिटल ऋण ऐप, ब्लैकमेल और धमकियों की रिपोर्ट करें।',
              bg: 'from-orange-500 to-red-500',
              icon: <ShieldAlert className="w-10 h-10 text-white/90" />
            },
            { 
              title: 'Identity Theft', 
              titleHi: 'पहचान की चोरी',
              desc: 'Report PAN/Aadhaar misuse and fake profiles.',
              descHi: 'पैन/आधार के दुरुपयोग और फर्जी प्रोफाइल की रिपोर्ट करें।',
              bg: 'from-purple-500 to-indigo-500',
              icon: <Fingerprint className="w-10 h-10 text-white/90" />
            },
            { 
              title: 'E-Commerce Scams', 
              titleHi: 'ई-कॉमर्स धोखाधड़ी',
              desc: 'Report fake websites, OLX, and delivery frauds.',
              descHi: 'फर्जी वेबसाइटों, OLX और डिलीवरी धोखाधड़ी की रिपोर्ट करें।',
              bg: 'from-emerald-500 to-teal-400',
              icon: <ShoppingCart className="w-10 h-10 text-white/90" />
            },
            { 
              title: 'Hacking & Malware', 
              titleHi: 'हैकिंग और मैलवेयर',
              desc: 'Report ransomware, viruses, and device breaches.',
              descHi: 'रैनसमवेयर, वायरस और डिवाइस हैकिंग की रिपोर्ट करें।',
              bg: 'from-gray-700 to-gray-900',
              icon: <Cpu className="w-10 h-10 text-white/90" />
            }
"""
    content = content[:start_idx] + new_array + content[end_idx:]

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("Successfully updated categories!")
