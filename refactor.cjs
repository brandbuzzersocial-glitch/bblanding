const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// Extract CSS string
const cssMatch = code.match(/const cs = `([\s\S]*?)`;/);
if (cssMatch) {
    fs.writeFileSync('src/App.css', cssMatch[1]);
    code = code.replace(cssMatch[0], '');
    code = code.replace(/<style>\{cs\}<\/style>/, '');
    code = 'import "./App.css";\n' + code;
    console.log('Extracted CSS');
}

// Extract arrays
const extractArray = (regex) => {
    const match = code.match(regex);
    if (match) {
        code = code.replace(match[0], '');
        return match[0];
    }
    return '';
};

let topContent = '';
topContent += extractArray(/const services = \[[\s\S]*?\];/) + '\n\n';
topContent += extractArray(/const projects = \[[\s\S]*?\];/) + '\n\n';
topContent += extractArray(/const testimonials = \[[\s\S]*?\];/) + '\n\n';

code = code.replace(/(import .*?\n)+/, match => match + '\n' + topContent);

fs.writeFileSync('src/App.jsx', code);
console.log('Done refactoring');
