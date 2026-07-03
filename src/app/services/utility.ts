

export class ObjToParams{

  toParams = (obj:any) => {
    return Object.keys(obj).map((key) => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
    }).join("&");
  }

}


