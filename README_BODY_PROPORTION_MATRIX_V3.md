# Body Proportion Matrix V3 — BackOffice (incremental)

Apply over the current BackOffice root.

UI:
- Accordion-based layout.
- Dynamic body-fat bands, glute anchors and breast anchors.
- Add intermediates between adjacent anchors with enforced ranges.
- Dynamic matrix accordions by fat and glute levels.
- Workflow node/input mapping in its own accordion, closed by default.
- Storage selector Auto / Local / Amazon S3 / Cloudflare R2.
- Danger-zone reset limited to this tool and selected sex.

Build:
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    npm run build
    npm run dev

Git:
    git add .
    git commit -m "feat: redesign body proportion tool with dynamic accordions"
    git push
