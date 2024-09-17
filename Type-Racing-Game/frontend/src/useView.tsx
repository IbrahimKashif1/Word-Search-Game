import { FunctionalComponent, h } from "preact";
import { Observer } from "./useObserver";

interface ViewProps {
  root?: HTMLElement;
}

export interface View extends Observer {
  root?: HTMLElement;
}

const withView = (
  Component: FunctionalComponent<ViewProps>
): FunctionalComponent<ViewProps> => {
  return (props) => {
    return <Component {...props} />;
  };
};

export default View;
export { withView };
