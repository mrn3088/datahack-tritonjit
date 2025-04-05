declare module '*.csv' {
    const content: string;
    export default content;
}

declare module '*.csv?url' {
    const url: string;
    export default url;
} 