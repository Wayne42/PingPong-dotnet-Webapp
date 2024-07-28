import Logger from "../Util/Logger";


class ToastViewHandler {
    static divToast: HTMLDivElement; 

    static ToastStack: Array<HTMLDivElement> = [];

    static renderToast(message: string, type: ToastViewHandler.ToastType) {
        Logger.log("New Toast: ", message, type);

        if (ToastViewHandler.divToast == null) {
            ToastViewHandler.divToast = document.getElementById("Toast") as HTMLDivElement;
        }

        let p = ToastViewHandler.ToastStack.pop();
        if (p != undefined) p.classList.add("hidden");

        let d = document.createElement("div");
        d.classList.add("toast");
        d.classList.add("hidden");
        d.classList.add(type);
        d.innerHTML = message;
        ToastViewHandler.divToast.appendChild(d);
        ToastViewHandler.ToastStack.push(d);
        setTimeout(() => {
            d.classList.remove("hidden");
            setTimeout(() => {
                d.classList.add("show");
            }, 80);


            // disappear in 5 seconds
            setTimeout(() => {
                d.classList.remove("show");
                setTimeout(() => {
                    d.classList.add("hidden");
                }, 350);
            }, 5000);
        }, 100);
    }

    renderSuccessToast(message: string) {
        
    }
}

namespace ToastViewHandler {
    export enum ToastType {
        DEFAULT = "default",
        SUCCESS = "success",
        ERROR = "error"
    }
}

export default ToastViewHandler;