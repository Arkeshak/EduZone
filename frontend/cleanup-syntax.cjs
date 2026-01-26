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

    // Case 1: Fixed by previous script incorrectly as `) {` but should be `}) {`
    // We look for `...props\n) {` or similar patterns where `) {` follows a prop list.
    // It is safer to just check if `function ... ({ ... ) {` is present? No regex is hard for that.
    // But we know `badge.jsx` has:
    //   ...props
    // ) {
    //
    // And it opened with `function Badge({`.
    // So we can look for `\n) {` and replace with `\n}) {` IF the previous lines look like props.
    // However, a simple search for `\n) {` might be dangerous if there are other functions.
    // But in these UI components, `) {` on a new line almost always closes the function params which are destructured.
    // Let's try matching `...props\s*\)\s*{` -> `...props\n}) {`

    // This handles `badge.jsx`.
    content = content.replace(/(\.\.\.props\s*)\)\s*{/g, '$1}) {');

    // Case 2: `toggle.jsx` style `} &\s*VariantProps... ) {` without the colon.
    // It was `...props\n} &\n  VariantProps... ) {`
    // We want to replace `} &\s*VariantProps[\s\S]*?\)\s*{` with `}) {`
    // BUT wait, `}` is already there. So `} & ... ) {` -> `}) {` means we keep the `}`?
    // In `toggle.jsx`:
    //   ...props
    // } &
    //   VariantProps<...> ) {
    //
    // The first `}` closes the prop destructuring?
    // Wait, `function Toggle({ ...props } & VariantProps) {`
    // This is valid TS intersection on the destructured OBJECT type.
    // So the `}` is NOT the closing of destructuring. The destructuring implicitly closes at the end of the type def.
    // `function Toggle({ ... }: Type) {`

    // So if we have `} & ...`, that `}` IS the closing of the destructuring object in the SOURCE code?
    // No, `function Toggle({ ... } & ...)` is NOT valid JS destructuring syntax. 
    // It is `function Toggle(props: { ... } & ...)` or `function Toggle({ ... }: { ... } & ...)`

    // In `toggle.jsx` viewing:
    // function Toggle({
    //   className,
    //   ...
    //   ...props
    // } &
    //   VariantProps<...>) {

    // This implies `function Toggle({ ... } & ...)` which is invalid JS.
    // It must have been `function Toggle({ ... }: { ... } & ...)` or similar.
    // But the `}` at line 32 suggests the destructuring block closed there???
    // If so, `&` is a bitwise AND operator? `function Toggle({ ... } & ...)`?
    // That refers to the object literal `{} & ...` which is not valid parameter list.

    // Ah, maybe the original code was:
    // function Toggle({ ... }: Type)
    // And `Type` was `{...} & VariantProps`.

    // So `toggle.jsx` has `} &` ...
    // I should replace `} &[\s\S]*?\)\s*{` with `}) {` ?
    // If I replace `} & ...` with `}) {`, I am effectively adding `}) {`.
    // Valid output: `function Toggle({ ... }) {`
    // So `...props` is followed by `}) {`.

    // So in `toggle.jsx`, we have `...props` then `}` then `&` ...
    // We want `...props` to be valid.
    // It should become `function Toggle({ ...props }) {`.
    // So we need to remove `} & ... ) {` and replace with `}) {`.
    // Wait, if `}` is already there after `...props\n`, then we just need `) {`.
    // No, `function Toggle({ ...props }) {`
    // In `toggle.jsx`:
    //   ...props
    // } & ...

    // Use regex: `}\s*&\s*VariantProps[\s\S]*?\)\s*{` -> `}) {`
    // This replaces `}` and the type stuff with `}) {`.
    // So `...props\n}) {`

    // Wait, if `toggle.jsx` has `}` at line 32:
    // line 32: `}`
    // line 33: `&`
    // ...
    // If I replace starting from `}`, I get `}) {`.
    // So result:
    //   ...props
    // }) {
    // That looks correct.

    content = content.replace(/}\s*&\s*VariantProps[\s\S]*?\)\s*{/g, '}) {');

    // Also handle `toggle-group.jsx` which might be similar.

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed syntax in: ${file}`);
        count++;
    }
});

console.log(`Cleanup finished. Updated ${count} files.`);
