module.exports = [
"[project]/src/registry/examples/wheel-picker-demo.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WheelPickerDemo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$wheel$2d$picker$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/registry/wheel-picker/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$wheel$2d$picker$2f$wheel$2d$picker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/registry/wheel-picker/wheel-picker.tsx [app-ssr] (ecmascript)");
;
;
const createArray = (length, add = 0)=>Array.from({
        length
    }, (_, i)=>{
        const value = i + add;
        return {
            label: value.toString().padStart(2, "0"),
            value: value
        };
    });
const hourOptions = createArray(12, 1);
const minuteOptions = createArray(60);
const meridiemOptions = [
    {
        label: "AM",
        value: "AM"
    },
    {
        label: "PM",
        value: "PM"
    }
];
function WheelPickerDemo() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-56",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$wheel$2d$picker$2f$wheel$2d$picker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WheelPickerWrapper"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$wheel$2d$picker$2f$wheel$2d$picker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WheelPicker"], {
                    options: hourOptions,
                    defaultValue: 9,
                    infinite: true
                }, void 0, false, {
                    fileName: "[project]/src/registry/examples/wheel-picker-demo.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$wheel$2d$picker$2f$wheel$2d$picker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WheelPicker"], {
                    options: minuteOptions,
                    defaultValue: 41,
                    infinite: true
                }, void 0, false, {
                    fileName: "[project]/src/registry/examples/wheel-picker-demo.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$registry$2f$wheel$2d$picker$2f$wheel$2d$picker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WheelPicker"], {
                    options: meridiemOptions,
                    defaultValue: "AM"
                }, void 0, false, {
                    fileName: "[project]/src/registry/examples/wheel-picker-demo.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/registry/examples/wheel-picker-demo.tsx",
            lineNumber: 23,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/registry/examples/wheel-picker-demo.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_registry_examples_wheel-picker-demo_tsx_e2266149._.js.map