import { state, defineComponent, property, createRef } from "@ni/core";
import NiComponent from "@ni/core";
import style from "./style.css";
// 使用接口定义组件中的所有属性及其类型
export interface Props {
  placeholder: string;
  type: "text" | "textarea";
  border: boolean;
  value: string;
  autosize: boolean;
}
@defineComponent({
  tag: "ni-input",
  style,
})
class Input extends NiComponent {
  @property({
    type: "string",
    observed: true,
  })
  placeholder: Props["placeholder"] = "默认";

  @property({
    type: "string",
    observed: true,
  })
  type: Props["type"] = "text";

  @property({
    observed: true,
    type: "boolean"
  })
  border: Props['border'] = false;
  
  @property({
    type: "string",
    observed: true
  })
  @state()
  value: Props['value'] = "";

  @property({
    observed: true,
    type: "boolean"
  })
  autosize: Props['autosize'] = false;

  handleFocus = () => {
    console.log("focus")
  }

  inputEl = createRef();

  handleInput = (e: InputEvent) => {
    e.stopPropagation();
    // 在组件内部去修改value值使得输入框中的内容可以发生改变
    this.value = e.target.value;
    this.$emit("input" ,{
      detail: "demo",
      cancelable: true,
      bubbles: true
    })
  }

  componentDidUpdate(propName: string, oldValue: string, newValue: string): void {
    console.log(propName)
  }

  render() {
    return (
      <div class="input-container">
        {this.type === "text" ? (
          <input type="text" placeholder={this.placeholder} class="input" onInput={this.handleInput} value={this.value} ref={this.inputEl}/>
        ) : (
          <textarea placeholder={this.placeholder} class="input" onInput={this.handleInput} value={this.value} ref={this.inputEl}></textarea>
        )}
      </div>
    );
  }
}

export default Input;
