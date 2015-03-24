﻿/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>

function expectInsensitive(s1: string, s2: string) {
    s1 = s1.replace(/\s/g, "");
    s1 = s1.replace(/;\"/g, "\"");
    expect(s1.toLowerCase()).toBe(s2.toLowerCase());
}

describe("updateElement", () => {
    it("set className", () => {
        var r = b.createNode({ tag: "div", className: "a" }, null, document.createElement("div"), null);
        expect((<HTMLElement>r.element).className).toBe("a");
    });

    it("set style by object", () => {
        var r = b.createNode({ tag: "div", style: { fontSize: "10px" } }, null, document.createElement("div"), null);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<divstyle=\"font-size:10px\"></div>");
    });

    it("set style by string", () => {
        var r = b.createNode({ tag: "div", style: "font-size:10px" }, null, document.createElement("div"), null);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<divstyle=\"font-size:10px\"></div>");
    });

    it("update style from string to object", () => {
        var r = b.createNode({ tag: "div", style: "font-size:5px" }, null, document.createElement("div"), null);
        r = b.updateNode({ tag: "div", style: { fontSize: "10px" } }, r);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<divstyle=\"font-size:10px\"></div>");
    });

    it("update style from object to string", () => {
        var r = b.createNode({ tag: "div", style: { fontSize: "5px" } }, null, document.createElement("div"), null);
        r = b.updateNode({ tag: "div", style: "font-size:10px" }, r);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<divstyle=\"font-size:10px\"></div>");
    });

    it("update style by removing property", () => {
        var r = b.createNode({ tag: "div", style: { fontSize: "10px", color: "black" } }, null, document.createElement("div"), null);
        r = b.updateNode({ tag: "div", style: { fontSize: "10px" } }, r);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<divstyle=\"font-size:10px\"></div>");
    });
});

describe("createNode", () => {
    it("simple", () => {
        var r = b.createNode({ tag: "div", children: "hello" }, null, document.createElement("div"), null);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div>hello</div>");
    });
    it("boolean is skipped", () => {
        var r = b.createNode({ tag: "div", children: true }, null, document.createElement("div"), null);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div></div>");
    });
    it("single child", () => {
        var r = b.createNode({ tag: "div", children: { tag: "span", children: "ok" } }, null, document.createElement("div"), null);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div><span>ok</span></div>");
    });
    it("multiple children", () => {
        var r = b.createNode({ tag: "div", children: [{ tag: "h1", children: "header" }, { tag: "div", children: "ok" }] }, null, document.createElement("div"), null);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div><h1>header</h1><div>ok</div></div>");
    });
    it("html child", () => {
        var r = b.createNode({ tag: "div", children: [{ tag: "/", children: "a<span>b</span>c" }] }, null, document.createElement("div"), null);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div>a<span>b</span>c</div>");
    });
    it("html children", () => {
        var r = b.createNode({ tag: "div", children: [{ tag: "/", children: "a<span>b</span>c" }, { tag: "/", children: "d<i>e</i>" }] }, null, document.createElement("div"), null);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div>a<span>b</span>cd<i>e</i></div>");
    });
    it("supports ref", () => {
        var comp1: IBobrilComponent = {
            render(ctx: IBobrilCtx, me: IBobrilNode) {
                me.tag = "div";
                me.children = { tag: "span", ref: [ctx, "test"], children: "cool" };
            },
            postRender(ctx: IBobrilCtx) {
                expect(ctx.refs["test"].tag).toBe("span");
            }
        };
        b.createNode({ component: comp1 }, null, document.createElement("div"), null);
    });
});

describe("updateNode", () => {
    it("simple", () => {
        var r = b.createNode({ tag: "div", children: "hello" }, null, document.createElement("div"), null);
        r = b.updateNode({ tag: "div", children: "bye" }, r);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div>bye</div>");
    });
    it("change single child from text to span", () => {
        var r = b.createNode({ tag: "div", children: "hello" }, null, document.createElement("div"), null);
        r = b.updateNode({ tag: "div", children: { tag: "span", children: "ok" } }, r);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div><span>ok</span></div>");
    });
    it("change single child from span to text", () => {
        var r = b.createNode({ tag: "div", children: { tag: "span", children: "ko" } }, null, document.createElement("div"), null);
        r = b.updateNode({ tag: "div", children: "ok" }, r);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div>ok</div>");
    });
    it("append text after text", () => {
        var r = b.createNode({ tag: "div", children: "A" }, null, document.createElement("div"), null);
        r = b.updateNode({ tag: "div", children: ["A", "B"] }, r);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div>AB</div>");
    });
    it("preppend text before text", () => {
        var r = b.createNode({ tag: "div", children: "A" }, null, document.createElement("div"), null);
        r = b.updateNode({ tag: "div", children: ["B", "A"] }, r);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div>BA</div>");
    });
    it("change html", () => {
        var r = b.createNode({ tag: "div", children: [{ tag: "/", children: "a<span>b</span>c" }] }, null, document.createElement("div"), null);
        r = b.updateNode({ tag: "div", children: [{ tag: "/", children: "d<i>e</i>f" }] }, r);
        expectInsensitive((<HTMLElement>r.element).outerHTML, "<div>d<i>e</i>f</div>");
    });

    function buildVdom(s: string): IBobrilNode {
        var items = s.split(",");
        var res: Array<IBobrilNode> = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i].split(":");
            if (item.length == 1) {
                res.push({ tag: "span", children: item[0] });
            } else {
                res.push({ tag: "span", key: item[0], children: item[1] });
            }
        }
        return { tag: "div", children: res };
    }

    function advancedTest(start: string, update: string, result: string) {
        var vdomStart = buildVdom(start);
        var r = b.createNode(vdomStart, null, document.createElement("div"), null);
        var c = (<HTMLElement>r.element).childNodes;
        for (var i = 0; i < c.length; i++) {
            (<HTMLElement>c[i]).id = "" + i;
        }
        var vdomUpdate = buildVdom(update);
        r = b.updateNode(vdomUpdate, r);
        var a: Array<string> = [];
        for (i = 0; i < (<IBobrilCacheNode[]>r.children).length; i++) {
            var ch = (<IBobrilCacheNode[]>r.children)[i];
            a.push((ch.key ? ch.key + ":" : "") + (<HTMLElement>ch.element).innerHTML + ((<HTMLElement>ch.element).id ? ":" + (<HTMLElement>ch.element).id : ""));
        }
        expect((<Node>r.element).childNodes.length).toBe((<IBobrilCacheNode[]>r.children).length);
        for (i = 0; i < (<IBobrilCacheNode[]>r.children).length; i++) {
            expect((<Node>r.element).childNodes[i]).toBe((<IBobrilCacheNode[]>r.children)[i].element);
        }
        expect(a.join(",").toLowerCase()).toBe(result.toLowerCase());
    }

    it("reorderKey", () => {
        advancedTest("a:A,b:B", "b:C,a:D", "b:C:1,a:D:0");
    });
    it("preppendKey", () => {
        advancedTest("a:A,b:B", "c:C,a:D,b:E", "c:C,a:D:0,b:E:1");
    });
    it("appendKey", () => {
        advancedTest("a:A,b:B", "a:C,b:D,c:E", "a:C:0,b:D:1,c:E");
    });
    it("removeFirstKey", () => {
        advancedTest("a:A,b:B,c:C", "b:D,c:E", "b:D:1,c:E:2");
    });
    it("removeMiddleKey", () => {
        advancedTest("a:A,b:B,c:C", "a:D,c:E", "a:D:0,c:E:2");
    });
    it("removeLastKey", () => {
        advancedTest("a:A,b:B,c:C", "a:D,b:E", "a:D:0,b:E:1");
    });
    it("nonKey", () => {
        advancedTest("A,B", "C,D", "C:0,D:1");
    });
    it("appendNonKey", () => {
        advancedTest("A,B", "C,D,E", "C:0,D:1,E");
    });
    it("removeNonKey", () => {
        advancedTest("A,B", "C", "C:0");
    });
    it("moveKeyBack", () => {
        advancedTest("a:A,b:B,c:C,d:D", "b:b,c:c,d:d,a:a", "b:b:1,c:c:2,d:d:3,a:a:0");
    });
    it("moveKeyNearlyBack", () => {
        advancedTest("a:A,b:B,c:C,d:D", "b:b,c:c,a:a,d:d", "b:b:1,c:c:2,a:a:0,d:d:3");
    });
    it("ThreeKeySwaps", () => {
        advancedTest("a:A,b:B,c:C,d:D,e:E,f:F", "b:b,a:a,d:d,c:c,f:f,e:e", "b:b:1,a:a:0,d:d:3,c:c:2,f:f:5,e:e:4");
    });
    it("reveseKeys", () => {
        advancedTest("a:A,b:B,c:C,d:D", "d:d,c:c,b:b,a:a", "d:d:3,c:c:2,b:b:1,a:a:0");
    });
    it("removeLastKeyAndNonKey1", () => {
        advancedTest("D,a:A,b:B,c:C", "a:E,b:F", "a:E:1,b:F:2");
    });
    it("removeLastKeyAndNonKey2", () => {
        advancedTest("a:A,D,b:B,c:C", "a:E,b:F", "a:E:0,b:F:2");
    });
    it("removeLastKeyAndNonKey3", () => {
        advancedTest("a:A,b:B,D,c:C", "a:E,b:F", "a:E:0,b:F:1");
    });
    it("removeLastKeyAndNonKey4", () => {
        advancedTest("a:A,b:B,c:C,D", "a:E,b:F", "a:E:0,b:F:1");
    });
    it("removeLastKeyAnd2NonKey1", () => {
        advancedTest("D1,D2,a:A,b:B,c:C", "a:E,b:F", "a:E:2,b:F:3");
    });
    it("removeLastKeyAnd2NonKey2", () => {
        advancedTest("a:A,D1,D2,b:B,c:C", "a:E,b:F", "a:E:0,b:F:3");
    });
    it("removeLastKeyAnd2NonKey3", () => {
        advancedTest("a:A,b:B,D1,D2,c:C", "a:E,b:F", "a:E:0,b:F:1");
    });
    it("removeLastKeyAnd2NonKey4", () => {
        advancedTest("a:A,b:B,c:C,D1,D2", "a:E,b:F", "a:E:0,b:F:1");
    });
    it("addLastKeyAndRemoveNonKey1", () => {
        advancedTest("C,a:A,b:B", "a:D,b:E,c:F", "a:D:1,b:E:2,c:F");
    });
    it("addLastKeyAndRemoveNonKey2", () => {
        advancedTest("a:A,C,b:B", "a:D,b:E,c:F", "a:D:0,b:E:2,c:F");
    });
    it("addLastKeyAndRemoveNonKey3", () => {
        advancedTest("a:A,b:B,C", "a:D,b:E,c:F", "a:D:0,b:E:1,c:F");
    });
    it("swapAddLastKeyAndAddNonKey1", () => {
        advancedTest("a:A,b:B", "b:D,a:E,c:F,C", "b:D:1,a:E:0,c:F,C");
    });
    it("complexSwapAddLastKeyAndAddNonKey1", () => {
        advancedTest("v:v,w:w,a:A,b:B", "w:W,v:V,b:D,a:E,C,c:F", "w:W:1,v:V:0,b:D:3,a:E:2,C,c:F");
    });
    it("swapAddLastKeyAndAddNonKey2", () => {
        advancedTest("a:A,b:B", "b:D,a:E,C,c:F", "b:D:1,a:E:0,C,c:F");
    });
    it("swapAddLastKeyAndAddNonKey3", () => {
        advancedTest("a:A,b:B", "b:D,C,a:E,c:F", "b:D:1,C,a:E:0,c:F");
    });
    it("remove2KeysAddNonKey", () => {
        advancedTest("a:A,b:B,c:E", "b:D,C", "b:D:1,C");
    });
    it("remove2KeysMoveNonKey", () => {
        advancedTest("a:A,b:B,c:E,C", "b:D,C", "b:D:1,C:3");
    });
    it("removeFirstKeyAdd2NonKey", () => {
        advancedTest("a:A,b:B,c:E", "b:D,C1,C2,c:F", "b:D:1,C1,C2,c:F:2");
    });
    it("moveNonKeyFront", () => {
        advancedTest("a:A,b:B,D,c:C", "a:E,D2,b:F,c:G", "a:E:0,D2:2,b:F:1,c:G:3");
    });
    it("complexMoveNonKeyFront", () => {
        advancedTest("x:x,y:y,a:A,b:B,D,c:C,v:v,w:w", "y:Y,x:X,a:E,D2,b:F,c:G,w:W,v:V", "y:Y:1,x:X:0,a:E:2,D2:4,b:F:3,c:G:5,w:W:7,v:V:6");
    });
    it("moveNonKeyBack", () => {
        advancedTest("a:A,D,b:B,c:C", "a:E,b:F,D2,c:G", "a:E:0,b:F:2,D2:1,c:G:3");
    });
    it("moveNonKeyBackAndRemoveLastNonKey", () => {
        advancedTest("a:A,D,b:B,c:C,D1", "a:E,b:F,D2,c:G", "a:E:0,b:F:2,D2:1,c:G:3");
    });
    it("moveNonKeyBackAndRemoveNonLastNonKey", () => {
        advancedTest("a:A,D,b:B,D1,c:C", "a:E,b:F,D2,c:G", "a:E:0,b:F:2,D2:3,c:G:4");
    });
    it("insertKeyWithLastNonKey", () => {
        advancedTest("a:A,b:B,F", "a:C,c:E,b:D,d:E2,G", "a:C:0,c:E,b:D:1,d:E2,G:2");
    });
});

describe("stopBubbling", () => {
    it("Without", () => {
        var outer = false;
        var inner = false;
        var n = b.createNode({
            tag: "div", component: {
                onClick: () => {
                    outer = true;
                    return true;
                }
            }, children: {
                tag: "span", component: {
                    onClick: () => {
                        inner = true;
                        return false;
                    }
                }
            }
        }, null, document.createElement("div"), null);
        expect(b.bubble((<IBobrilCacheNode[]>n.children)[0], "onClick", null)).toBeTruthy();
        expect(inner).toBeTruthy();
        expect(outer).toBeTruthy();
    });
    it("With", () => {
        var outer = false;
        var bub = false;
        var inner = false;
        var n = b.createNode({
            tag: "div",
            component: {
                onClick: () => {
                    outer = true;
                    return true;
                }
            },
            children: {
                tag: "span",
                component: {
                    shouldStopBubble: (ctx: Object, name: string, param: any) => {
                        expect(name).toBe("onClick");
                        bub = true;
                        return true;
                    },
                    onClick: () => {
                        inner = true;
                        return false;
                    }
                }
            }
        }, null, document.createElement("div"), null);
        expect(b.bubble((<IBobrilCacheNode[]>n.children)[0], "onClick", null)).toBeFalsy();
        expect(inner).toBeTruthy();
        expect(bub).toBeTruthy();
        expect(outer).toBeFalsy();
    });
});
