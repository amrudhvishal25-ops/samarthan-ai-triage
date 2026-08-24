import sys

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

old_dropdown = """                    <option value="Women/Children Related Crime">Women/Children Related Crime</option>
                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Hate Speech">Hate Speech</option>
                    <option value="Online Ragging">Online Ragging</option>
                    <option value="Social Media Hacking">Social Media Hacking</option>
                    <option value="Other Cyber Crime">Other Cyber Crime</option>"""

new_dropdown = """                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Women/Children Crime">Women/Children Crime</option>
                    <option value="Extortion & Blackmail">Extortion & Blackmail</option>
                    <option value="Identity Theft">Identity Theft</option>
                    <option value="E-Commerce Scams">E-Commerce Scams</option>
                    <option value="Hacking & Malware">Hacking & Malware</option>"""

content = content.replace(old_dropdown, new_dropdown)

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)

print("Updated dropdown!")
