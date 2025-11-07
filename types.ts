export interface FlickrPhoto {
  id: string;
  owner: string;
  secret: string;
  server: string;
  farm: number;
  title: string;
  ispublic: number;
  isfriend: number;
  isfamily: number;
  url_l?: string; // Large image URL
  owner_name: string;
  tags: string;
}

export interface FlickrApiResponse {
  photos: {
    page: number;
    pages: number;
    perpage: number;
    total: number;
    photo: FlickrPhoto[];
  };
  stat: string;
}

export interface FlickrUser {
  id: string;
  nsid: string;
  username: {
    _content: string;
  };
}

export interface FlickrUserResponse {
  user?: FlickrUser;
  stat: string;
  code?: number;
  message?: string;
}
