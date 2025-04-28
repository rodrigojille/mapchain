declare module '*.json' {
  const value: {
    abi: any[];
    bytecode: string;
  };
  export default value;
}
