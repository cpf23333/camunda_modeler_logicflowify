import { ModelProp } from "@/utils/extend";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Component, createEffect } from "solid-js";
dayjs.extend(isoWeek);
interface DateProps {
  /**input标签的type属性，时间日期相关的 */
  type: "datetime-local" | "date" | "month" | "week" | "time" | "timeSecond";
  /**格式化，不传会给Date对象 */
  format?:
    | "YYYY-MM-DD"
    | "HH:mm:ss"
    | "YYYY-MM-DDTHH:mm"
    | "YYYY-MM-DDTHH:mm:ss";
}
export let DateSelect: Component<ModelProp<DateProps>> = (props) => {
  let [model, setModel] = props.model;
  createEffect(() => {});
  let getVal = () => {
    let val = model();
    if (val) {
      let d = dayjs(val);
      if (props.type === "datetime-local") {
        val = dayjs(val).format("YYYY-MM-DDTHH:mm");
      } else if (props.type === "date") {
        val = dayjs(val).format("YYYY-MM-DD");
      } else if (props.type === "time") {
        val = dayjs(val).format("HH:mm");
      } else if (props.type === "timeSecond") {
        val = dayjs(val).format("HH:mm:ss");
      } else if (props.type === "month") {
        val = dayjs(val).format("YYYY-MM");
      } else {
        if (props.type === "week") {
          val = d.format("YYYY-") + d.isoWeek();
        }
      }
    }
    return val;
  };
  return (
    <input
      type={props.type}
      value={getVal()}
      onChange={(e) => {
        if (e.target.value) {
          let date = dayjs(e.target.value).format(props.format);
          setModel(date);
        } else {
          setModel(null);
        }
      }}></input>
  );
};
