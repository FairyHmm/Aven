import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { SVG } from "mathjax-full/js/output/svg.js";

// MathJax, loaded on first use (see render.ts): TeX in, an <svg> out. The
// glyphs are drawn as paths inside each svg, so there are no fonts to load,
// and the svg takes the text colour.
//
// Left out: `require` and `autoload` (they fetch more code at run time) and
// `html` (`\href`, `\class`, `\style`: a card can be shared, so it must not be
// able to put links or styles in the page).
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const document = mathjax.document("", {
  InputJax: new TeX({
    packages: AllPackages.filter(
      name => !["require", "autoload", "html"].includes(name),
    ),
    tags: "none",
  }),
  OutputJax: new SVG({ fontCache: "none" }),
});

export function typeset(tex: string, display: boolean): string {
  // MathJax's typings leave `convert` as `any`; it gives the container node.
  // oxlint-disable-next-line typescript/no-unsafe-argument
  return adaptor.innerHTML(document.convert(tex, { display }));
}
