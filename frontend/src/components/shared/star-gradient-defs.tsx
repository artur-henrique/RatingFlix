// Um <linearGradient> do SVG não é uma cor — é definido uma vez no documento
// e referenciado de qualquer lugar via fill="url(#id)". Não dá pra fazer
// isso com uma classe do Tailwind sozinha (gradiente CSS normal não se
// aplica a `fill` de SVG), por isso esse componente existe: renderiza a
// definição do gradiente uma única vez (aqui, no layout raiz), e qualquer
// <Star> na árvore inteira consegue referenciar "star-gold-gradient".
export function StarGradientDefs() {
  return (
    <svg aria-hidden="true" className="absolute h-0 w-0" focusable="false">
      <defs>
        <linearGradient id="star-gold-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#f5b301" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
    </svg>
  );
}
