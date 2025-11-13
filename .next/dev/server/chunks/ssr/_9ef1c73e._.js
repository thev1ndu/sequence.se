module.exports = [
"[project]/src/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout,
    "metadata",
    ()=>metadata,
    "viewport",
    ()=>viewport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/script.js [app-rsc] (ecmascript)");
;
;
;
(function() {
    try {
        // Helper to strip attributes starting with known extension prefixes
        function stripAttrs(root) {
            const els = root.getElementsByTagName ? root.getElementsByTagName('*') : [];
            for(let i = 0; i < els.length; i++){
                const el = els[i];
                const attrs = Array.from(el.attributes || []);
                for(let j = 0; j < attrs.length; j++){
                    const name = attrs[j] && attrs[j].name;
                    if (!name) continue;
                    // Cover common extension patterns
                    if (name.startsWith('bis_') || name.startsWith('data-bis') || name === 'bis_skin_checked') {
                        try {
                            el.removeAttribute(name);
                        } catch (e) {}
                    }
                }
            }
        }
        // Remove current injected attributes/scripts synchronously
        stripAttrs(document);
        const extScripts = document.querySelectorAll('script[src^="chrome-extension://"], script[src^="moz-extension://"], script[src^="safari-extension://"]');
        for(let k = 0; k < extScripts.length; k++){
            try {
                extScripts[k].remove();
            } catch (e) {}
        }
        // Watch for attributes/scripts added shortly after parse (some extensions act during parse)
        const observer = new MutationObserver((mutations)=>{
            for(let m = 0; m < mutations.length; m++){
                const mu = mutations[m];
                if (mu.type === 'attributes' && mu.target && mu.target.removeAttribute) {
                    const name = mu.attributeName;
                    if (name && (name.startsWith('bis_') || name.startsWith('data-bis') || name === 'bis_skin_checked')) {
                        try {
                            mu.target.removeAttribute(name);
                        } catch (e) {}
                    }
                }
                if (mu.type === 'childList' && mu.addedNodes && mu.addedNodes.length) {
                    for(let i = 0; i < mu.addedNodes.length; i++){
                        const node = mu.addedNodes[i];
                        try {
                            if (node.nodeType === 1) {
                                // strip attributes on newly added elements
                                stripAttrs(node);
                                if (node.tagName === 'SCRIPT') {
                                    const src = node.getAttribute && node.getAttribute('src');
                                    if (src && (src.indexOf('chrome-extension://') === 0 || src.indexOf('moz-extension://') === 0 || src.indexOf('safari-extension://') === 0)) {
                                        node.remove();
                                    }
                                }
                            }
                        } catch (e) {}
                    }
                }
            }
        });
        observer.observe(document, {
            attributes: true,
            childList: true,
            subtree: true
        });
        // Stop observing shortly after hydration period to avoid overhead.
        // 3000ms is a practical window that captures most extension injections.
        setTimeout(()=>{
            try {
                observer.disconnect();
            } catch (e) {}
        }, 3000);
    } catch (_) {}
})();
// Thanks @shadcn-ui, @tailwindcss
const darkModeScript = String.raw`
  try {
    if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      // Use a literal here to avoid circular import issues during module evaluation
      document.querySelector('meta[name="theme-color"]').setAttribute('content', '#09090b')
    }
  } catch (_) {}

  try {
    if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
      document.documentElement.classList.add('os-macos')
    }
  } catch (_) {}
  // Remove known extension-injected attributes and scripts that cause
  // hydration mismatches. Run as early as possible during parse so the
  // client DOM matches the SSR output.
  try {
    // Remove attributes beginning with 'bis_' or 'data-bis'
    const all = document.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      const attrs = Array.from(el.attributes || []);
      for (let j = 0; j < attrs.length; j++) {
        const name = attrs[j] && attrs[j].name;
        if (name && (name.startsWith('bis_') || name.startsWith('data-bis'))) {
          el.removeAttribute(name);
        }
      }
    }

    // Remove any script tags injected from chrome extensions
    const extScripts = document.querySelectorAll('script[src^="chrome-extension://"]');
    for (let k = 0; k < extScripts.length; k++) {
      extScripts[k].remove();
    }
  } catch (_) {}
`;
const metadata = {
    metadataBase: new URL(SITE_INFO.url),
    alternates: {
        canonical: "/"
    },
    title: {
        template: `%s – ${SITE_INFO.name}`,
        default: `${USER.displayName} – ${USER.jobTitle}`
    },
    description: SITE_INFO.description,
    keywords: SITE_INFO.keywords,
    authors: [
        {
            name: "ncdai",
            url: SITE_INFO.url
        }
    ],
    creator: "ncdai",
    openGraph: {
        siteName: SITE_INFO.name,
        url: "/",
        type: "profile",
        firstName: USER.firstName,
        lastName: USER.lastName,
        username: USER.username,
        gender: USER.gender,
        images: [
            {
                url: SITE_INFO.ogImage,
                width: 1200,
                height: 630,
                alt: SITE_INFO.name
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        creator: "@iamncdai",
        images: [
            SITE_INFO.ogImage
        ]
    },
    icons: {
        icon: [
            {
                url: "https://i.postimg.cc/YqFC7XHk/HD-logo.jpg",
                sizes: "any"
            },
            {
                url: "https://i.postimg.cc/YqFC7XHk/HD-logo.jpg",
                type: "image/svg+xml"
            }
        ],
        apple: {
            url: "https://i.postimg.cc/YqFC7XHk/HD-logo.jpg",
            type: "image/png",
            sizes: "180x180"
        }
    }
};
const viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    // Avoid referencing META_THEME_COLORS at module eval time (prevents circular import issues)
    themeColor: '#ffffff'
};
function RootLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "en",
        className: `${fontSans.variable} ${fontMono.variable}`,
        suppressHydrationWarning: true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("head", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                        type: "text/javascript",
                        dangerouslySetInnerHTML: {
                            __html: darkModeScript
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/layout.tsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        src: `data:text/javascript;base64,${btoa(darkModeScript)}`
                    }, void 0, false, {
                        fileName: "[project]/src/app/layout.tsx",
                        lineNumber: 196,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        id: "strip-bis-attributes",
                        strategy: "beforeInteractive",
                        dangerouslySetInnerHTML: {
                            __html: String.raw`
            try {
              // Remove any attributes starting with "bis_" which some browser
              // extensions inject and cause hydration mismatches.
              const all = document.getElementsByTagName('*');
              for (let i = 0; i < all.length; i++) {
                const el = all[i];
                // Copy attributes because NamedNodeMap is live
                const attrs = Array.from(el.attributes || []);
                for (let j = 0; j < attrs.length; j++) {
                  const name = attrs[j] && attrs[j].name;
                  if (name && name.startsWith('bis_')) {
                    el.removeAttribute(name);
                  }
                }
              }
            } catch (_) {}
          `
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/layout.tsx",
                        lineNumber: 200,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                        type: "application/ld+json",
                        suppressHydrationWarning: true,
                        dangerouslySetInnerHTML: {
                            __html: JSON.stringify(getWebSiteJsonLd()).replace(/</g, "\\u003c")
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/layout.tsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/layout.tsx",
                lineNumber: 187,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
                suppressHydrationWarning: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Providers, {
                    children: children
                }, void 0, false, {
                    fileName: "[project]/src/app/layout.tsx",
                    lineNumber: 232,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/layout.tsx",
                lineNumber: 231,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/layout.tsx",
        lineNumber: 182,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-rsc] (ecmascript)").vendored['react-rsc'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/client/script.js [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__, module, exports) => {

// This file is generated by next-core EcmascriptClientReferenceModule.
const { createClientModuleProxy } = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
__turbopack_context__.n(createClientModuleProxy("[project]/node_modules/next/dist/client/script.js <module evaluation>"));
}),
"[project]/node_modules/next/dist/client/script.js [app-rsc] (client reference proxy)", ((__turbopack_context__, module, exports) => {

// This file is generated by next-core EcmascriptClientReferenceModule.
const { createClientModuleProxy } = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
__turbopack_context__.n(createClientModuleProxy("[project]/node_modules/next/dist/client/script.js"));
}),
"[project]/node_modules/next/dist/client/script.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$script$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/script.js [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$script$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/script.js [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$script$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/node_modules/next/script.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/client/script.js [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_9ef1c73e._.js.map