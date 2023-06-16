
import { defineComponent, property, state } from "@ni/core"
import NiComponent from "@ni/core"
import style from "./style.css"
type ButtonType = "success" | "warn" | "error" | "default";
// 使用类装饰器
@defineComponent({
    tag: "ni-count",
    style
})
class Count extends NiComponent {
    // 将count属性设置为响应式
    @state()
    count: number = 0;

    @property({
        observed: true,
        type: "string"
    })
    type: ButtonType = "default"
    
    click = () => {
        this.count++;
    }

    render() {
        return (
            <div class="count-container">
                <div>{this.count}</div>
                <button class={this.type} onClick={this.click}>{this.type} -- 点击+1</button>
            </div>
        )
    }
}

export default Count;