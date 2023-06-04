import { NiComponent, propertyStore, stateStore } from "./NiComponent";
export interface Property {
    readonly observed?: boolean; //TODO 表示该属性是否需要进行观察，如果设置为true则代表该属性需要向外暴露让用户可以从标签上传入对应的值
    readonly type?: "number" | "string" | "boolean" | "array" | "object"
}

export interface Component {
    tag: string;
    style?: string;
}

// 1.property装饰器--用于标记并且收集需要向外界暴露的属性
export function property(options: Property = {}) {
    return function(target: any, key: string) {
        (target.constructor as typeof NiComponent).useProperty(key, options);
    }
}
// 2. state装饰器 -- 用于标签那些响应式属性
export function state() {
    return function(target: any, key: string) {
        (target.constructor as typeof NiComponent).useState(key);
    }
}
// 3.defineComponent --用于注册自定义的WebComponent构造函数
export function defineComponent(options: Component) {
    return function(target: typeof NiComponent) {
        class SubNiComponent extends target {
            // 用于表明哪些暴露出去的属性需要进行监听
            static get observedAttributes(): string[] {
                const observedArray: string[] = [];
                propertyStore.forEach((constructor, key, options) => {
                    if(constructor === target && options.observed) {
                        observedArray.push(key);
                    }
                }) 

                return observedArray;
            }
            constructor() {
                super();
                const shallowRoot = this.attachShadow({mode:"open"});

                if(shallowRoot) {
                    const styleEl = document.createElement("style");
                    styleEl.innerHTML += options.style ?? "";
                    shallowRoot.appendChild(styleEl);
                }

                stateStore.forEach((cons, key, descriptorFunc) => {
                    if(cons === target) {
                        //TODO 将原来对象上的所有用property装饰器和state装饰器修饰的值属性都转为访问器属性
                        Object.defineProperty(this, key, descriptorFunc(this[key]));
                    }
                })
            }
        }

        if (!customElements.get(options.tag)) {
            // 注册自己的自定义组件
            customElements.define(options.tag, SubNiComponent);
        }
    }
}