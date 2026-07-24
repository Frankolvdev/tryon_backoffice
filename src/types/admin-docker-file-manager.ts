export interface DockerVolume { name:string; driver:string; mountpoint:string; scope:string; labels:Record<string,string>; options:Record<string,string>; created_at?:string|null }
export interface DockerEntry { name:string; path:string; type:"file"|"directory"; size:number; modified_at:string }
export interface DockerBrowse { volume:string; path:string; items:DockerEntry[] }
