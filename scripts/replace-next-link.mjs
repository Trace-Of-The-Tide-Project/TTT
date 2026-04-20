import fs from "fs";
import path from "path";

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next") continue;
      walk(p);
    } else if (/\.tsx?$/.test(p)) {
      let s = fs.readFileSync(p, "utf8");
      const o = s;
      s = s.replace(/import Link from ['"]next\/link['"];?\r?\n/g, 'import { Link } from "@/i18n/navigation";\n');
      if (s !== o) {
        fs.writeFileSync(p, s);
        console.log(p);
      }
    }
  }
}

walk(path.join(process.cwd(), "src"));
