declare namespace JSX {
    interface IntrinsicElements {
        'razorpay-trusted-business': React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement>, // Base HTML attributes
            HTMLElement
        > & {
            // Define the specific properties (props) the widget accepts
            key: string;                                    // Mandatory API Key ID
            'dark-mode'?: 'true' | 'false';                 // Optional dark mode
            'hide_attributes'?: string;                     // Comma-separated attributes to hide
        };
    }
}