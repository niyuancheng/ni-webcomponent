import { state, defineComponent, property } from "@ni/core";
import NiComponent from "@ni/core";
import style from "./style.css";
export interface Props {
  placeholder: string;
  type: "text" | "textarea";
  border: boolean;
  value: string;
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
  value: Props['value'] = ""

  handleFocus = () => {
    console.log("focus")
  }

  handleInput = (e: InputEvent) => {
    e.stopPropagation();
    // 在组件内部去修改value值使得输入框中的内容可以发生改变
    this.value = e.target.value;
    this.$emit("input", e)
  }

  render() {
    return (
      <div class="input-container">
        {this.type === "text" ? (
          <input type="text" placeholder={this.placeholder} class="input" onInput={this.handleInput} value={this.value}/>
        ) : (
          <textarea placeholder={this.placeholder} class="input"></textarea>
        )}
      </div>
    );
  }
}

export default Input;
