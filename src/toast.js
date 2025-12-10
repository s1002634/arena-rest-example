import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Toast notification component
 * Similar to media-stage-control.html's showToast function
 */
class Toast extends React.Component {
    componentDidMount() {
        // Auto dismiss after 3 seconds
        this.timer = setTimeout(() => {
            this.props.onDismiss();
        }, 3000);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    render() {
        return (
            <div className="toast">
                <div className="toast-title">{this.props.title}</div>
                <div className="toast-description">{this.props.description}</div>
            </div>
        );
    }
}

/**
 * Toast container that manages multiple toast notifications
 */
class ToastContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            toasts: []
        };
        this.nextId = 0;
    }

    show = (title, description) => {
        const id = this.nextId++;
        this.setState(prevState => ({
            toasts: [...prevState.toasts, { id, title, description }]
        }));
    }

    dismiss = (id) => {
        this.setState(prevState => ({
            toasts: prevState.toasts.filter(toast => toast.id !== id)
        }));
    }

    render() {
        return (
            <div id="toastContainer">
                {this.state.toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        title={toast.title}
                        description={toast.description}
                        onDismiss={() => this.dismiss(toast.id)}
                    />
                ))}
            </div>
        );
    }
}

// Global toast instance
let toastContainerInstance = null;

// Initialize toast container in the DOM
export function initToastContainer() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const ref = React.createRef();
    ReactDOM.render(<ToastContainer ref={ref} />, container);

    // Wait for component to mount
    setTimeout(() => {
        toastContainerInstance = ref.current;
    }, 0);
}

// Show toast notification
export function showToast(title, description) {
    if (toastContainerInstance) {
        toastContainerInstance.show(title, description);
    } else {
        console.warn('Toast container not initialized. Call initToastContainer() first.');
    }
}

export default Toast;
