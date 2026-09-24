// props.js — όλα τα props σε ένα object: require('./props.js') όπως πάντα. Ο κώδικας ζει στο props/<θέμα>.js.
// Κατάλογος (τι υπάρχει, πού): node api.js · Νέο prop: 1η χρήση μέσα στο επεισόδιο, 2η → props/<θέμα>.js με σχόλιο περιγραφής.
// Κάθε αρχείο του props/ φορτώνεται αυτόματα (νέο αρχείο = καμία αλλαγή εδώ). Ίδιο όνομα σε δύο αρχεία → error.
const fs = require('fs'), path = require('path'), dir = path.join(__dirname, 'props');
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
  const m = require(path.join(dir, f));
  for (const k of Object.keys(m)) { if (k in module.exports) throw new Error(`props: το «${k}» υπάρχει ήδη (props/${f})`); module.exports[k] = m[k]; }
}
