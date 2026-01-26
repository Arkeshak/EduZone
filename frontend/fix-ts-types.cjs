const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app', 'components', 'ui');

if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

let count = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove : React.ComponentProps<...>
    content = content.replace(/:\s*React\.ComponentProps<[^>]+>/g, '');

    // Remove intersection types in function params like } & { ... }
    // We match } & { until the next closing brace or something reasonable. 
    // Usually it's like `} & { prop?: type })` 
    // Since we are not a parser, we might be a bit aggressive or careful.
    // The pattern seems to be `} & {` followed by content and closing `})`.
    // Let's try to remove ` & { ... }` from the function signature.

    // Regex: Matches `} & {` ... `}` at the end of what looks like argument list?
    // A simpler approach: replace `} & {[^}]+}` with `}`? but there could be nested braces.
    // But in these UI components, it's usually `} & { variant?: ... }`.

    // Let's match `} & {[^{}]+}` (non-recursive)
    content = content.replace(/}\s*&\s*{[^{}]+}/g, '}');

    // Also handle cases where it spans multiple lines.
    // Javascript regex . matches newline if s flag is used or [^]
    // content = content.replace(/}\s*&\s*{[\s\S]*?}/g, '}'); // Too dangerous?

    // In `select.jsx`, it was:
    // } & {
    //   size?: "sm" | "default";
    // }) {

    // So we can replace `} & {` ... `}) {` with `}) {`
    // Regex: /}\s*&\s*{[\s\S]*?}\)\s*{/g  -> '}) {' 
    // This looks for closing brace of first arg, then & {, then stuff, then } for type, then ) { for function body.

    content = content.replace(/}\s*&\s*{[\s\S]*?}\)\s*{/g, '}) {');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed types in: ${file}`);
        count++;
    }
});

console.log(`Script finished. Updated ${count} files.`);
