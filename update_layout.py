import sys

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# The exact action buttons block to move:
action_buttons = """              {/* Action buttons */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-4">
                <a href="tel:1930" className="flex flex-col items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-4 font-bold text-sm transition-all shadow-md hover:shadow-lg">
                  <Phone className="w-5 h-5" />
                  {hi ? '1930 कॉल करें' : 'Call 1930'}
                </a>
                <button onClick={handleShare} className="flex flex-col items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl py-4 font-bold text-sm transition-all shadow-md hover:shadow-lg">
                  <Share2 className="w-5 h-5" />
                  {hi ? 'परिवार को भेजें' : 'Share Status'}
                </button>
              </motion.div>

              <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-2xl py-4 font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
                <Printer className="w-5 h-5" />
                {hi ? 'PDF / प्रिंट करें' : 'Save as PDF / Print'}
              </button>"""

# Find where to remove it from
if action_buttons in content:
    content = content.replace(action_buttons, "")
else:
    print("Could not find action buttons block to remove.")
    sys.exit(1)

# Find where to insert it (at the end of the left column)
insert_target = """                </div>
              </motion.div>
            </div>"""

if insert_target in content:
    new_left_column_end = f"""                </div>
              </motion.div>

{action_buttons}
            </div>"""
    content = content.replace(insert_target, new_left_column_end)
else:
    print("Could not find insert target.")
    sys.exit(1)

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)

print("Successfully moved action buttons!")
