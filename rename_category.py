import sys

# 1. Update page.tsx
with open('src/app/page.tsx', 'r') as f:
    page_content = f.read()

# Update Filters
old_filters = """  const filters = hi 
    ? ['वित्तीय धोखाधड़ी', 'महिला/बाल अपराध', 'जबरन वसूली (Extortion)', 'पहचान की चोरी', 'ई-कॉमर्स धोखाधड़ी', 'हैकिंग और मैलवेयर']
    : ['Financial Fraud', 'Women/Children Crime', 'Extortion & Blackmail', 'Identity Theft', 'E-Commerce Scams', 'Hacking & Malware']"""

new_filters = """  const filters = hi 
    ? ['वित्तीय धोखाधड़ी', 'महिला/बाल अपराध', 'जबरन वसूली (Extortion)', 'पहचान की चोरी', 'ई-कॉमर्स धोखाधड़ी', 'अन्य साइबर अपराध']
    : ['Financial Fraud', 'Women/Children Crime', 'Extortion & Blackmail', 'Identity Theft', 'E-Commerce Scams', 'Other Cyber Crimes']"""

page_content = page_content.replace(old_filters, new_filters)

# Update Card
old_card = """            { 
              title: 'Hacking & Malware', 
              titleHi: 'हैकिंग और मैलवेयर',
              desc: 'Report ransomware, viruses, and device breaches.',
              descHi: 'रैनसमवेयर, वायरस और डिवाइस हैकिंग की रिपोर्ट करें।',
              bg: 'from-gray-700 to-gray-900',
              icon: <Cpu className="w-10 h-10 text-white/90" />
            }"""

new_card = """            { 
              title: 'Other Cyber Crimes', 
              titleHi: 'अन्य साइबर अपराध',
              desc: 'Report hacking, data theft, and other threats.',
              descHi: 'हैकिंग, डेटा चोरी और अन्य साइबर खतरों की रिपोर्ट करें।',
              bg: 'from-gray-700 to-gray-900',
              icon: <Briefcase className="w-10 h-10 text-white/90" />
            }"""

page_content = page_content.replace(old_card, new_card)

# Make sure Briefcase is imported
if "Briefcase" not in page_content:
    page_content = page_content.replace("Cpu } from 'lucide-react'", "Cpu, Briefcase } from 'lucide-react'")

with open('src/app/page.tsx', 'w') as f:
    f.write(page_content)


# 2. Update dashboard/page.tsx
with open('src/app/dashboard/page.tsx', 'r') as f:
    dash_content = f.read()

old_option = '<option value="Hacking & Malware">Hacking & Malware</option>'
new_option = '<option value="Other Cyber Crimes">Other Cyber Crimes</option>'
dash_content = dash_content.replace(old_option, new_option)

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(dash_content)

print("Renamed category successfully!")
