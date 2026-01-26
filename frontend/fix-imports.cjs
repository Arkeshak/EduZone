const fs = require('fs');
const path = require('path');

const walk = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath, fileList);
        } else {
            if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
};

const fixImports = () => {
    const pagesDir = path.join(__dirname, 'src', 'pages');
    const files = walk(pagesDir);
    let count = 0;

    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('@/components/ui/')) {
            content = content.replace(/@\/components\/ui\//g, '@/app/components/ui/');
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated: ${file}`);
            count++;
        }
    });
    console.log(`Fixed imports in ${count} files.`);
};

fixImports();
