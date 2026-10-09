import re, os, shutil
t=open('index.template.html').read()
v=open('version.txt').read().strip()
logo=open('logo/mark.svg').read().replace('xmlns="http://www.w3.org/2000/svg" ','')
logo=re.sub(r'\s+',' ',logo).strip()
out=t.replace('__LOGO_SVG__',logo).replace('__APP_VERSION__',v)
open('index.html','w').write(out)
if os.path.isdir('site'): shutil.copy('index.html','site/index.html')
print(len(out))
