# Hotfix — numeric input regex

Corrige exclusivamente el campo numérico de Body Proportions.

Causa:
El hotfix anterior dejó `\\d` dentro de un regex literal de TypeScript. Eso no coincide con dígitos y bloqueaba toda escritura.

Fix:
`/^-?\d*(?:[.,]\d*)?$/`

Permite:
- 1
- 0.5
- -0.5
- -1.25
- 0,5
- estados intermedios como `-`, `-0`, `-0.`

No modifica backend ni ninguna otra vista.

Git:
git add .
git commit -m "fix: restore numeric editing in body proportion inputs"
git push
