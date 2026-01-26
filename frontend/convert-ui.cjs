const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/components/ui');

if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
}

const files = fs.readdirSync(dir);

files.forEach(file => {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;

    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove type imports
    content = content.replace(/import\s+{([^}]+)}\s+from/g, (match, body) => {
        const parts = body.split(',').map(p => p.trim()).filter(p => !p.startsWith('type '));
        if (parts.length === 0) return '';
        return `import { ${parts.join(', ')} } from`;
    });
    content = content.replace(/import type\s+.*?;/g, '');

    // Remove generics in React.forwardRef<...>
    content = content.replace(/React\.forwardRef<[^>]+>/g, 'React.forwardRef');

    // Remove : Type in props: function Foo({}: Type)
    content = content.replace(/\):\s*[^{]*{/g, ') {');

    // Remove : Type in arguments: (val: string) -> (val)
    // Naive: remove ': ...' until , or )
    // content = content.replace(/:\s*[A-Z][a-zA-Z0-9\[\]\|<>\s]*/g, ''); // Too aggressive

    // Specific cleanups for Shadcn patterns
    content = content.replace(/as\s+React\.[A-Za-z]+/g, '');
    content = content.replace(/React\.ComponentProps<"[^"]+">/g, '');
    content = content.replace(/& VariantProps<typeof [^>]+>/g, '');

    // Clean up empty lines from stripped imports
    content = content.replace(/^\s*[\r\n]/gm, '');

    const newExt = file.endsWith('.tsx') ? '.jsx' : '.js';
    const newPath = path.join(dir, file.replace(/\.tsx?$/, newExt));

    // Only write if new file doesn't exist (avoid overwriting manual work)
    if (!fs.existsSync(newPath)) {
        fs.writeFileSync(newPath, content);
        console.log(`Converted: ${file} -> ${path.basename(newPath)}`);
    } else {
        console.log(`Skipping existing: ${path.basename(newPath)}`);
    }

    // Verify creation then delete old
    if (fs.existsSync(newPath)) {
        fs.unlinkSync(filePath);
    }
});
