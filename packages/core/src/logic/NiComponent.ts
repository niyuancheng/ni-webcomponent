import { h, Fragment, render, hydrate, createRef } from "../vdom";
import { KeyMap } from "./KeyMap"
import type { Property } from "./decorator";
import { convertStringToTaregt, convertTargetToString } from "./utils";
import cloneDeep from "lodash/cloneDeep"
// 保存需要向外暴露出的属性
const propertyStore = new KeyMap<typeof NiComponent, string, Property>();
// 保存仅限内部使用的响应式属性（改变该属性可以触发UI的更新）
const stateStore = new KeyMap<typeof NiComponent, string, (defaultValue: any) => PropertyDescriptor>();

class NiComponent extends HTMLElement {
    static h = h;
    static defaultOptions: Property = {
        observed: true,
        type: "string"
    }

    // 生成property装饰器修饰的值属性的描述符{get:xxx,set:xxx},该函数的功能是将指定对象中的普通值属性转为访问器属性
    static generatePropertyDescriptor(key: string, options: Property): (defaultValue: any) => PropertyDescriptor{
        return function(defaultValue: any) {
            //TODO 返回一个访问器对象,需要注意的是访问器属性的get,set方法都只有在使用xxx.xxx时才会触发，
            //TODO 而在外部获取自定义组件的示例并且使用setAttribute则不会触发，反而会跳过组件的依赖收集和依赖触发的步骤，因此不建议这样去修改
            return {
                // 访问器属性get方法的最大用处是在类的内部获取该属性时能够返回对应的值
                get(this: NiComponent) {
                    let val = this.getAttribute(key);
                    // 首先查看val值是否存在，如果不存在就返回默认的value值：也就是类初始化时变量赋予的值
                    console.log(key, options)
                    if(val === null) {
                        return defaultValue;
                    } else {
                        // 如果存在val值首先我们需要考虑val是否为布尔类型的变量，因为如果标签上存在布尔类型的变量返回值是空串
                        if(val === "") {
                            // 如果val是空串的情况下，需要考虑是否为布尔类型变量，如果不是，则代表这个属性用户想要删除之，因此返回默认值
                            if(options.type === "boolean") {
                                return true;
                            } else {
                                return defaultValue;
                            }
                        } else {
                            return convertStringToTaregt(val, options);
                        }
                    }
                },
                set(this: NiComponent, newVal: any){
                    const oldVal = this.getAttribute(key);
                    if(newVal === "" || newVal === false) {
                        this.removeAttribute(key);
                    } else {
                        if(newVal === true) {
                            this.setAttribute(key, "")
                        } else {
                            newVal = convertTargetToString(newVal, options);
                            this.setAttribute(key, newVal);
                        }
                    }
                },
                enumerable: true,
                configurable: true
            }
        } 
    }

    // 生成状态描述符，用于实现组件的响应式
    static generateStateDescriptor(key: string): (defaultValue: any) => PropertyDescriptor {
        return function(defaultValue: any) {
            let value_ = defaultValue;
            return {
                get(this: NiComponent) {
                    return value_;
                },
                set(this: NiComponent, value: any) {
                    if(value !== value_) {
                        value_ = value;
                        this._render();
                    }
                }
            }
        } 
    }

    // 用于保存挂载了property装饰器的属性
    static useProperty(name: string, options: Property) {
        options = Object.assign(cloneDeep(this.defaultOptions), options);
        // console.log(name, options)
        propertyStore.set(this, name, options);
        stateStore.set(this, name, this.generatePropertyDescriptor(name, options));
    }

    // 用于保存需要进行视图响应式的属性
    static useState(name: string) {
        stateStore.set(this, name, this.generateStateDescriptor(name))
    }

    // 模仿react中的类组件，在render函数中返回jsx/tsx对象
    render() {
        return "" as any;
    }
    //TODO 接下来需要做的就是将UI视图挂载到影子DOM内部，需要使用到虚拟DOM和diff算法
    private _render() {
        // 调用render函数获得虚拟DOM，接着需要将虚拟DOM挂载到影子DOM上并且进行diff算法进行最小量的更新
        const vnode = this.render();
        if(vnode && this.shadowRoot) {
            render(vnode, this.shadowRoot);
        }
    }

    componentDidMount() {}

    componentWillUnMount() {}

    /**
   * 控制当前属性变化是否导致组件渲染，该方法是模仿的react类组件中的形式
   * @param propName 属性名
   * @param oldValue 属性旧值
   * @param newValue 属性新值
   * @returns {boolean}
   */
    shouldComponentUpdate(propName: string, oldValue: string, newValue: string) {
        return oldValue !== newValue;
    }

    componentDidUpdate(propName: string, oldValue: string, newValue: string) {}

    //TODO 当组件第一次挂载到页面上的时候触发该函数,在内部需要将UI视图添加到影子DOM内(组件的原生生命周期)
    connectedCallback() {
        /**
         * 初始值重写后首次渲染
         */
        this._render();
        if(this.componentDidMount && typeof this.componentDidMount === "function") {
            this.componentDidMount();
        } 
    }

    //TODO 当暴露出去的属性发生变化时触发该回调函数，此时需要重新渲染视图(组件的原生生命周期)
    attributeChangedCallback(name: string, oldValue: string, value: string) {
        // const newVnode = this.render();

        if(!this.shouldComponentUpdate(name, oldValue, value)) {
            return;
        }
        this._render();
        if(this.componentDidUpdate && typeof this.componentDidUpdate === "function") {
            this.componentDidUpdate(name, oldValue, value);
        }
    }
    
    //TODO 当组件从视图上卸载时触发该方法(组件的原生生命周期)
    disconnectedCallback() {
        if(this.componentWillUnMount && typeof this.componentWillUnMount === "function") {
            this.componentWillUnMount();
        }

        render(null, this.shadowRoot)
    }

    // 触发自定义事件
    $emit<T>(eventName: string, customEventInit?: CustomEventInit<T>) {
        this.dispatchEvent(new CustomEvent(eventName, Object.assign({bubbles: false}, customEventInit ?? {})))
    }
}

export { NiComponent, Fragment, render, hydrate, createRef, propertyStore, stateStore }