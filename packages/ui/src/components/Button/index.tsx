import { defineComponent, property } from "@ni/core"
import NiComponent from "@ni/core"
import style from "./style.css"

// 该接口描述了webcomponent上的属性
interface Props {
    type: "success" | "primary" | "warning" | "error";
    size: "small" | "medium" | "large";
    disabled: boolean;
    border: boolean;
    dashed: boolean;
    color: string;
}

@defineComponent({
    tag: "ni-button",
    style
})
class Button extends NiComponent {
    @property({
        type: "string",
        observed: true
    })
    type: Props["type"];
    
    @property({
        type: "string",
        observed: true
    })
    size: Props["size"];

    @property({
        type: "boolean",
        observed: true
    })
    disabled: Props["disabled"] = false;

    @property({
        observed: true,
        type: "boolean"
    })
    border: Props["disabled"] = false;

    @property({
        observed: true,
        type: "boolean"
    })
    dashed: Props["dashed"] = false;

    @property({
        observed: true,
        type: 'string'
    })
    color: Props["color"] = null;
    handleClick = (e: Event) => {
        // 首先禁止原生click事件的冒泡，而是使用自定义事件去进行冒泡，这样更方便我们的参数传递!!
        e.stopPropagation();
        this.$emit("click", {
            cancelable: true,
            bubbles: true
        })
    }

    // 是否应该进行更新
    shouldComponentUpdate(propName: string, oldValue: string, newValue: string): boolean {
        return true;
    }

    render() {
        return (
            <div class="btn-container" onClick={this.handleClick} style={{background: this.color ?? ""}}>
                <slot name="icon"></slot>
                <slot></slot>
            </div>
        )
    }
}

export default Button