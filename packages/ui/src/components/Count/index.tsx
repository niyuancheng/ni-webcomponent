import { defineComponent, property, state } from "@ni/core"
import NiComponent from "@ni/core"

type ButtonType = "success" | "warn" | "error" | "default";
// 使用类装饰器
@defineComponent({
    tag: "ni-count"
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
            <div>
                <div>{this.count}</div>
                <button class={this.type}>{this.type} -- 点击+1</button>
            </div>
        )
    }
}

export default Count;