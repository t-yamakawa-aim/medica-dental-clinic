import { jsxRenderer } from 'hono/jsx-renderer'
import { SITE } from './data/site'

export const renderer = jsxRenderer(({ children, title, description }) => {
  const pageTitle = title ? `${title}｜${SITE.name}` : `${SITE.name}｜金沢市の歯科医院`
  const pageDescription = description || SITE.description

  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="format-detection" content="telephone=no" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Roboto:wght@500;700&display=swap"
          rel="stylesheet"
        />

        {/* Icons */}
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />

        {/* Styles */}
        <link href="/static/style.css" rel="stylesheet" />

        {/* Favicon (simple) */}
        <link rel="icon" href="/static/images/logo.png" />
      </head>
      <body>
        {children}
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})
