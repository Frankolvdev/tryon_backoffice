export interface AncestryCatalogItem {
  key: string;
  displayName: string;
  countryName: string;
  countryCode: string;
  flagEmoji: string;
  latitude: number | null;
  longitude: number | null;
  aliases: string[];
  featured: boolean;
  sortOrder: number;
}

export const ANCESTRY_CATALOG: AncestryCatalogItem[] = [
  {
    "key": "american",
    "displayName": "American",
    "countryName": "United States",
    "countryCode": "US",
    "flagEmoji": "🇺🇸",
    "latitude": 39.8283,
    "longitude": -98.5795,
    "aliases": [
      "USA",
      "United States",
      "US"
    ],
    "featured": true,
    "sortOrder": 10
  },
  {
    "key": "russian",
    "displayName": "Russian",
    "countryName": "Russia",
    "countryCode": "RU",
    "flagEmoji": "🇷🇺",
    "latitude": 61.524,
    "longitude": 105.3188,
    "aliases": [
      "Russia",
      "Russian Federation"
    ],
    "featured": true,
    "sortOrder": 20
  },
  {
    "key": "brazilian",
    "displayName": "Brazilian",
    "countryName": "Brazil",
    "countryCode": "BR",
    "flagEmoji": "🇧🇷",
    "latitude": -14.235,
    "longitude": -51.9253,
    "aliases": [
      "Brazil"
    ],
    "featured": true,
    "sortOrder": 30
  },
  {
    "key": "colombian",
    "displayName": "Colombian",
    "countryName": "Colombia",
    "countryCode": "CO",
    "flagEmoji": "🇨🇴",
    "latitude": 4.5709,
    "longitude": -74.2973,
    "aliases": [
      "Colombia"
    ],
    "featured": true,
    "sortOrder": 40
  },
  {
    "key": "mexican",
    "displayName": "Mexican",
    "countryName": "Mexico",
    "countryCode": "MX",
    "flagEmoji": "🇲🇽",
    "latitude": 23.6345,
    "longitude": -102.5528,
    "aliases": [
      "Mexico"
    ],
    "featured": true,
    "sortOrder": 50
  },
  {
    "key": "italian",
    "displayName": "Italian",
    "countryName": "Italy",
    "countryCode": "IT",
    "flagEmoji": "🇮🇹",
    "latitude": 41.8719,
    "longitude": 12.5674,
    "aliases": [
      "Italy"
    ],
    "featured": true,
    "sortOrder": 60
  },
  {
    "key": "french",
    "displayName": "French",
    "countryName": "France",
    "countryCode": "FR",
    "flagEmoji": "🇫🇷",
    "latitude": 46.2276,
    "longitude": 2.2137,
    "aliases": [
      "France"
    ],
    "featured": true,
    "sortOrder": 70
  },
  {
    "key": "spanish",
    "displayName": "Spanish",
    "countryName": "Spain",
    "countryCode": "ES",
    "flagEmoji": "🇪🇸",
    "latitude": 40.4637,
    "longitude": -3.7492,
    "aliases": [
      "Spain"
    ],
    "featured": true,
    "sortOrder": 80
  },
  {
    "key": "argentinian",
    "displayName": "Argentinian",
    "countryName": "Argentina",
    "countryCode": "AR",
    "flagEmoji": "🇦🇷",
    "latitude": -38.4161,
    "longitude": -63.6167,
    "aliases": [
      "Argentina",
      "Argentine"
    ],
    "featured": true,
    "sortOrder": 90
  },
  {
    "key": "arab",
    "displayName": "Arab",
    "countryName": "Arab region",
    "countryCode": "ARAB",
    "flagEmoji": "🌍",
    "latitude": 24.0,
    "longitude": 45.0,
    "aliases": [
      "Arab",
      "Arabic",
      "Middle East",
      "Middle Eastern"
    ],
    "featured": true,
    "sortOrder": 100
  },
  {
    "key": "japanese",
    "displayName": "Japanese",
    "countryName": "Japan",
    "countryCode": "JP",
    "flagEmoji": "🇯🇵",
    "latitude": 36.2048,
    "longitude": 138.2529,
    "aliases": [
      "Japan"
    ],
    "featured": true,
    "sortOrder": 110
  },
  {
    "key": "korean",
    "displayName": "Korean",
    "countryName": "South Korea",
    "countryCode": "KR",
    "flagEmoji": "🇰🇷",
    "latitude": 35.9078,
    "longitude": 127.7669,
    "aliases": [
      "Korea",
      "South Korea",
      "Republic of Korea"
    ],
    "featured": true,
    "sortOrder": 120
  },
  {
    "key": "indian",
    "displayName": "Indian",
    "countryName": "India",
    "countryCode": "IN",
    "flagEmoji": "🇮🇳",
    "latitude": 20.5937,
    "longitude": 78.9629,
    "aliases": [
      "India"
    ],
    "featured": true,
    "sortOrder": 130
  },
  {
    "key": "african",
    "displayName": "African",
    "countryName": "African region",
    "countryCode": "AFR",
    "flagEmoji": "🌍",
    "latitude": 1.5,
    "longitude": 20.0,
    "aliases": [
      "Africa",
      "African"
    ],
    "featured": true,
    "sortOrder": 140
  },
  {
    "key": "afghanistan",
    "displayName": "Afghanistan",
    "countryName": "Afghanistan",
    "countryCode": "AF",
    "flagEmoji": "🇦🇫",
    "latitude": 33.0,
    "longitude": 65.0,
    "aliases": [
      "Afghanistan",
      "Islamic Republic of Afghanistan"
    ],
    "featured": false,
    "sortOrder": 1000
  },
  {
    "key": "albania",
    "displayName": "Albania",
    "countryName": "Albania",
    "countryCode": "AL",
    "flagEmoji": "🇦🇱",
    "latitude": 41.0,
    "longitude": 20.0,
    "aliases": [
      "Albania",
      "Republic of Albania"
    ],
    "featured": false,
    "sortOrder": 1001
  },
  {
    "key": "algeria",
    "displayName": "Algeria",
    "countryName": "Algeria",
    "countryCode": "DZ",
    "flagEmoji": "🇩🇿",
    "latitude": 28.0,
    "longitude": 3.0,
    "aliases": [
      "Algeria",
      "People's Democratic Republic of Algeria"
    ],
    "featured": false,
    "sortOrder": 1002
  },
  {
    "key": "american-samoa",
    "displayName": "American Samoa",
    "countryName": "American Samoa",
    "countryCode": "AS",
    "flagEmoji": "🇦🇸",
    "latitude": -14.33333333,
    "longitude": -170.0,
    "aliases": [
      "American Samoa"
    ],
    "featured": false,
    "sortOrder": 1003
  },
  {
    "key": "andorra",
    "displayName": "Andorra",
    "countryName": "Andorra",
    "countryCode": "AD",
    "flagEmoji": "🇦🇩",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Andorra",
      "Principality of Andorra"
    ],
    "featured": false,
    "sortOrder": 1004
  },
  {
    "key": "angola",
    "displayName": "Angola",
    "countryName": "Angola",
    "countryCode": "AO",
    "flagEmoji": "🇦🇴",
    "latitude": -12.5,
    "longitude": 18.5,
    "aliases": [
      "Angola",
      "Republic of Angola"
    ],
    "featured": false,
    "sortOrder": 1005
  },
  {
    "key": "anguilla",
    "displayName": "Anguilla",
    "countryName": "Anguilla",
    "countryCode": "AI",
    "flagEmoji": "🇦🇮",
    "latitude": 18.25,
    "longitude": -63.16666666,
    "aliases": [
      "Anguilla"
    ],
    "featured": false,
    "sortOrder": 1006
  },
  {
    "key": "antarctica",
    "displayName": "Antarctica",
    "countryName": "Antarctica",
    "countryCode": "AQ",
    "flagEmoji": "🇦🇶",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Antarctica"
    ],
    "featured": false,
    "sortOrder": 1007
  },
  {
    "key": "antigua-and-barbuda",
    "displayName": "Antigua and Barbuda",
    "countryName": "Antigua and Barbuda",
    "countryCode": "AG",
    "flagEmoji": "🇦🇬",
    "latitude": 17.05,
    "longitude": -61.8,
    "aliases": [
      "Antigua and Barbuda"
    ],
    "featured": false,
    "sortOrder": 1008
  },
  {
    "key": "armenia",
    "displayName": "Armenia",
    "countryName": "Armenia",
    "countryCode": "AM",
    "flagEmoji": "🇦🇲",
    "latitude": 40.0,
    "longitude": 45.0,
    "aliases": [
      "Armenia",
      "Republic of Armenia"
    ],
    "featured": false,
    "sortOrder": 1009
  },
  {
    "key": "aruba",
    "displayName": "Aruba",
    "countryName": "Aruba",
    "countryCode": "AW",
    "flagEmoji": "🇦🇼",
    "latitude": 12.5,
    "longitude": -69.96666666,
    "aliases": [
      "Aruba"
    ],
    "featured": false,
    "sortOrder": 1010
  },
  {
    "key": "australia",
    "displayName": "Australia",
    "countryName": "Australia",
    "countryCode": "AU",
    "flagEmoji": "🇦🇺",
    "latitude": -27.0,
    "longitude": 133.0,
    "aliases": [
      "Australia"
    ],
    "featured": false,
    "sortOrder": 1011
  },
  {
    "key": "austria",
    "displayName": "Austria",
    "countryName": "Austria",
    "countryCode": "AT",
    "flagEmoji": "🇦🇹",
    "latitude": 47.33333333,
    "longitude": 13.33333333,
    "aliases": [
      "Austria",
      "Republic of Austria"
    ],
    "featured": false,
    "sortOrder": 1012
  },
  {
    "key": "azerbaijan",
    "displayName": "Azerbaijan",
    "countryName": "Azerbaijan",
    "countryCode": "AZ",
    "flagEmoji": "🇦🇿",
    "latitude": 40.5,
    "longitude": 47.5,
    "aliases": [
      "Azerbaijan",
      "Republic of Azerbaijan"
    ],
    "featured": false,
    "sortOrder": 1013
  },
  {
    "key": "bahamas",
    "displayName": "Bahamas",
    "countryName": "Bahamas",
    "countryCode": "BS",
    "flagEmoji": "🇧🇸",
    "latitude": 24.25,
    "longitude": -76.0,
    "aliases": [
      "Bahamas",
      "Commonwealth of the Bahamas"
    ],
    "featured": false,
    "sortOrder": 1014
  },
  {
    "key": "bahrain",
    "displayName": "Bahrain",
    "countryName": "Bahrain",
    "countryCode": "BH",
    "flagEmoji": "🇧🇭",
    "latitude": 26.0,
    "longitude": 50.55,
    "aliases": [
      "Bahrain",
      "Kingdom of Bahrain"
    ],
    "featured": false,
    "sortOrder": 1015
  },
  {
    "key": "bangladesh",
    "displayName": "Bangladesh",
    "countryName": "Bangladesh",
    "countryCode": "BD",
    "flagEmoji": "🇧🇩",
    "latitude": 24.0,
    "longitude": 90.0,
    "aliases": [
      "Bangladesh",
      "People's Republic of Bangladesh"
    ],
    "featured": false,
    "sortOrder": 1016
  },
  {
    "key": "barbados",
    "displayName": "Barbados",
    "countryName": "Barbados",
    "countryCode": "BB",
    "flagEmoji": "🇧🇧",
    "latitude": 13.16666666,
    "longitude": -59.53333333,
    "aliases": [
      "Barbados"
    ],
    "featured": false,
    "sortOrder": 1017
  },
  {
    "key": "belarus",
    "displayName": "Belarus",
    "countryName": "Belarus",
    "countryCode": "BY",
    "flagEmoji": "🇧🇾",
    "latitude": 53.0,
    "longitude": 28.0,
    "aliases": [
      "Belarus",
      "Republic of Belarus"
    ],
    "featured": false,
    "sortOrder": 1018
  },
  {
    "key": "belgium",
    "displayName": "Belgium",
    "countryName": "Belgium",
    "countryCode": "BE",
    "flagEmoji": "🇧🇪",
    "latitude": 50.83333333,
    "longitude": 4.0,
    "aliases": [
      "Belgium",
      "Kingdom of Belgium"
    ],
    "featured": false,
    "sortOrder": 1019
  },
  {
    "key": "belize",
    "displayName": "Belize",
    "countryName": "Belize",
    "countryCode": "BZ",
    "flagEmoji": "🇧🇿",
    "latitude": 17.25,
    "longitude": -88.75,
    "aliases": [
      "Belize"
    ],
    "featured": false,
    "sortOrder": 1020
  },
  {
    "key": "benin",
    "displayName": "Benin",
    "countryName": "Benin",
    "countryCode": "BJ",
    "flagEmoji": "🇧🇯",
    "latitude": 9.5,
    "longitude": 2.25,
    "aliases": [
      "Benin",
      "Republic of Benin"
    ],
    "featured": false,
    "sortOrder": 1021
  },
  {
    "key": "bermuda",
    "displayName": "Bermuda",
    "countryName": "Bermuda",
    "countryCode": "BM",
    "flagEmoji": "🇧🇲",
    "latitude": 32.33333333,
    "longitude": -64.75,
    "aliases": [
      "Bermuda"
    ],
    "featured": false,
    "sortOrder": 1022
  },
  {
    "key": "bhutan",
    "displayName": "Bhutan",
    "countryName": "Bhutan",
    "countryCode": "BT",
    "flagEmoji": "🇧🇹",
    "latitude": 27.5,
    "longitude": 90.5,
    "aliases": [
      "Bhutan",
      "Kingdom of Bhutan"
    ],
    "featured": false,
    "sortOrder": 1023
  },
  {
    "key": "bolivia-plurinational-state-of",
    "displayName": "Bolivia, Plurinational State of",
    "countryName": "Bolivia, Plurinational State of",
    "countryCode": "BO",
    "flagEmoji": "🇧🇴",
    "latitude": -17.0,
    "longitude": -65.0,
    "aliases": [
      "Bolivia, Plurinational State of",
      "Plurinational State of Bolivia",
      "Bolivia"
    ],
    "featured": false,
    "sortOrder": 1024
  },
  {
    "key": "bonaire-sint-eustatius-and-saba",
    "displayName": "Bonaire, Sint Eustatius and Saba",
    "countryName": "Bonaire, Sint Eustatius and Saba",
    "countryCode": "BQ",
    "flagEmoji": "🇧🇶",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Bonaire, Sint Eustatius and Saba"
    ],
    "featured": false,
    "sortOrder": 1025
  },
  {
    "key": "bosnia-and-herzegovina",
    "displayName": "Bosnia and Herzegovina",
    "countryName": "Bosnia and Herzegovina",
    "countryCode": "BA",
    "flagEmoji": "🇧🇦",
    "latitude": 44.0,
    "longitude": 18.0,
    "aliases": [
      "Bosnia and Herzegovina",
      "Republic of Bosnia and Herzegovina"
    ],
    "featured": false,
    "sortOrder": 1026
  },
  {
    "key": "botswana",
    "displayName": "Botswana",
    "countryName": "Botswana",
    "countryCode": "BW",
    "flagEmoji": "🇧🇼",
    "latitude": -22.0,
    "longitude": 24.0,
    "aliases": [
      "Botswana",
      "Republic of Botswana"
    ],
    "featured": false,
    "sortOrder": 1027
  },
  {
    "key": "bouvet-island",
    "displayName": "Bouvet Island",
    "countryName": "Bouvet Island",
    "countryCode": "BV",
    "flagEmoji": "🇧🇻",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Bouvet Island"
    ],
    "featured": false,
    "sortOrder": 1028
  },
  {
    "key": "british-indian-ocean-territory",
    "displayName": "British Indian Ocean Territory",
    "countryName": "British Indian Ocean Territory",
    "countryCode": "IO",
    "flagEmoji": "🇮🇴",
    "latitude": -6.0,
    "longitude": 71.5,
    "aliases": [
      "British Indian Ocean Territory"
    ],
    "featured": false,
    "sortOrder": 1029
  },
  {
    "key": "brunei-darussalam",
    "displayName": "Brunei Darussalam",
    "countryName": "Brunei Darussalam",
    "countryCode": "BN",
    "flagEmoji": "🇧🇳",
    "latitude": 4.5,
    "longitude": 114.66666666,
    "aliases": [
      "Brunei Darussalam"
    ],
    "featured": false,
    "sortOrder": 1030
  },
  {
    "key": "bulgaria",
    "displayName": "Bulgaria",
    "countryName": "Bulgaria",
    "countryCode": "BG",
    "flagEmoji": "🇧🇬",
    "latitude": 43.0,
    "longitude": 25.0,
    "aliases": [
      "Bulgaria",
      "Republic of Bulgaria"
    ],
    "featured": false,
    "sortOrder": 1031
  },
  {
    "key": "burkina-faso",
    "displayName": "Burkina Faso",
    "countryName": "Burkina Faso",
    "countryCode": "BF",
    "flagEmoji": "🇧🇫",
    "latitude": 13.0,
    "longitude": -2.0,
    "aliases": [
      "Burkina Faso"
    ],
    "featured": false,
    "sortOrder": 1032
  },
  {
    "key": "burundi",
    "displayName": "Burundi",
    "countryName": "Burundi",
    "countryCode": "BI",
    "flagEmoji": "🇧🇮",
    "latitude": -3.5,
    "longitude": 30.0,
    "aliases": [
      "Burundi",
      "Republic of Burundi"
    ],
    "featured": false,
    "sortOrder": 1033
  },
  {
    "key": "cabo-verde",
    "displayName": "Cabo Verde",
    "countryName": "Cabo Verde",
    "countryCode": "CV",
    "flagEmoji": "🇨🇻",
    "latitude": 16.0,
    "longitude": -24.0,
    "aliases": [
      "Cabo Verde",
      "Republic of Cabo Verde"
    ],
    "featured": false,
    "sortOrder": 1034
  },
  {
    "key": "cambodia",
    "displayName": "Cambodia",
    "countryName": "Cambodia",
    "countryCode": "KH",
    "flagEmoji": "🇰🇭",
    "latitude": 13.0,
    "longitude": 105.0,
    "aliases": [
      "Cambodia",
      "Kingdom of Cambodia"
    ],
    "featured": false,
    "sortOrder": 1035
  },
  {
    "key": "cameroon",
    "displayName": "Cameroon",
    "countryName": "Cameroon",
    "countryCode": "CM",
    "flagEmoji": "🇨🇲",
    "latitude": 6.0,
    "longitude": 12.0,
    "aliases": [
      "Cameroon",
      "Republic of Cameroon"
    ],
    "featured": false,
    "sortOrder": 1036
  },
  {
    "key": "canada",
    "displayName": "Canada",
    "countryName": "Canada",
    "countryCode": "CA",
    "flagEmoji": "🇨🇦",
    "latitude": 60.0,
    "longitude": -95.0,
    "aliases": [
      "Canada"
    ],
    "featured": false,
    "sortOrder": 1037
  },
  {
    "key": "cayman-islands",
    "displayName": "Cayman Islands",
    "countryName": "Cayman Islands",
    "countryCode": "KY",
    "flagEmoji": "🇰🇾",
    "latitude": 19.5,
    "longitude": -80.5,
    "aliases": [
      "Cayman Islands"
    ],
    "featured": false,
    "sortOrder": 1038
  },
  {
    "key": "central-african-republic",
    "displayName": "Central African Republic",
    "countryName": "Central African Republic",
    "countryCode": "CF",
    "flagEmoji": "🇨🇫",
    "latitude": 7.0,
    "longitude": 21.0,
    "aliases": [
      "Central African Republic"
    ],
    "featured": false,
    "sortOrder": 1039
  },
  {
    "key": "chad",
    "displayName": "Chad",
    "countryName": "Chad",
    "countryCode": "TD",
    "flagEmoji": "🇹🇩",
    "latitude": 15.0,
    "longitude": 19.0,
    "aliases": [
      "Chad",
      "Republic of Chad"
    ],
    "featured": false,
    "sortOrder": 1040
  },
  {
    "key": "chile",
    "displayName": "Chile",
    "countryName": "Chile",
    "countryCode": "CL",
    "flagEmoji": "🇨🇱",
    "latitude": -30.0,
    "longitude": -71.0,
    "aliases": [
      "Chile",
      "Republic of Chile"
    ],
    "featured": false,
    "sortOrder": 1041
  },
  {
    "key": "china",
    "displayName": "China",
    "countryName": "China",
    "countryCode": "CN",
    "flagEmoji": "🇨🇳",
    "latitude": 35.0,
    "longitude": 105.0,
    "aliases": [
      "China",
      "People's Republic of China"
    ],
    "featured": false,
    "sortOrder": 1042
  },
  {
    "key": "christmas-island",
    "displayName": "Christmas Island",
    "countryName": "Christmas Island",
    "countryCode": "CX",
    "flagEmoji": "🇨🇽",
    "latitude": -10.5,
    "longitude": 105.66666666,
    "aliases": [
      "Christmas Island"
    ],
    "featured": false,
    "sortOrder": 1043
  },
  {
    "key": "cocos-keeling-islands",
    "displayName": "Cocos (Keeling) Islands",
    "countryName": "Cocos (Keeling) Islands",
    "countryCode": "CC",
    "flagEmoji": "🇨🇨",
    "latitude": -12.5,
    "longitude": 96.83333333,
    "aliases": [
      "Cocos (Keeling) Islands"
    ],
    "featured": false,
    "sortOrder": 1044
  },
  {
    "key": "comoros",
    "displayName": "Comoros",
    "countryName": "Comoros",
    "countryCode": "KM",
    "flagEmoji": "🇰🇲",
    "latitude": -12.16666666,
    "longitude": 44.25,
    "aliases": [
      "Comoros",
      "Union of the Comoros"
    ],
    "featured": false,
    "sortOrder": 1045
  },
  {
    "key": "congo",
    "displayName": "Congo",
    "countryName": "Congo",
    "countryCode": "CG",
    "flagEmoji": "🇨🇬",
    "latitude": -1.0,
    "longitude": 15.0,
    "aliases": [
      "Congo",
      "Republic of the Congo"
    ],
    "featured": false,
    "sortOrder": 1046
  },
  {
    "key": "congo-the-democratic-republic-of-the",
    "displayName": "Congo, The Democratic Republic of the",
    "countryName": "Congo, The Democratic Republic of the",
    "countryCode": "CD",
    "flagEmoji": "🇨🇩",
    "latitude": 0.0,
    "longitude": 25.0,
    "aliases": [
      "Congo, The Democratic Republic of the"
    ],
    "featured": false,
    "sortOrder": 1047
  },
  {
    "key": "cook-islands",
    "displayName": "Cook Islands",
    "countryName": "Cook Islands",
    "countryCode": "CK",
    "flagEmoji": "🇨🇰",
    "latitude": -21.23333333,
    "longitude": -159.76666666,
    "aliases": [
      "Cook Islands"
    ],
    "featured": false,
    "sortOrder": 1048
  },
  {
    "key": "costa-rica",
    "displayName": "Costa Rica",
    "countryName": "Costa Rica",
    "countryCode": "CR",
    "flagEmoji": "🇨🇷",
    "latitude": 10.0,
    "longitude": -84.0,
    "aliases": [
      "Costa Rica",
      "Republic of Costa Rica"
    ],
    "featured": false,
    "sortOrder": 1049
  },
  {
    "key": "croatia",
    "displayName": "Croatia",
    "countryName": "Croatia",
    "countryCode": "HR",
    "flagEmoji": "🇭🇷",
    "latitude": 45.16666666,
    "longitude": 15.5,
    "aliases": [
      "Croatia",
      "Republic of Croatia"
    ],
    "featured": false,
    "sortOrder": 1050
  },
  {
    "key": "cuba",
    "displayName": "Cuba",
    "countryName": "Cuba",
    "countryCode": "CU",
    "flagEmoji": "🇨🇺",
    "latitude": 21.5,
    "longitude": -80.0,
    "aliases": [
      "Cuba",
      "Republic of Cuba"
    ],
    "featured": false,
    "sortOrder": 1051
  },
  {
    "key": "cura-ao",
    "displayName": "Curaçao",
    "countryName": "Curaçao",
    "countryCode": "CW",
    "flagEmoji": "🇨🇼",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Curaçao"
    ],
    "featured": false,
    "sortOrder": 1052
  },
  {
    "key": "cyprus",
    "displayName": "Cyprus",
    "countryName": "Cyprus",
    "countryCode": "CY",
    "flagEmoji": "🇨🇾",
    "latitude": 35.0,
    "longitude": 33.0,
    "aliases": [
      "Cyprus",
      "Republic of Cyprus"
    ],
    "featured": false,
    "sortOrder": 1053
  },
  {
    "key": "czechia",
    "displayName": "Czechia",
    "countryName": "Czechia",
    "countryCode": "CZ",
    "flagEmoji": "🇨🇿",
    "latitude": 49.75,
    "longitude": 15.5,
    "aliases": [
      "Czechia",
      "Czech Republic"
    ],
    "featured": false,
    "sortOrder": 1054
  },
  {
    "key": "c-te-d-ivoire",
    "displayName": "Côte d'Ivoire",
    "countryName": "Côte d'Ivoire",
    "countryCode": "CI",
    "flagEmoji": "🇨🇮",
    "latitude": 8.0,
    "longitude": -5.0,
    "aliases": [
      "Côte d'Ivoire",
      "Republic of Côte d'Ivoire"
    ],
    "featured": false,
    "sortOrder": 1055
  },
  {
    "key": "denmark",
    "displayName": "Denmark",
    "countryName": "Denmark",
    "countryCode": "DK",
    "flagEmoji": "🇩🇰",
    "latitude": 56.0,
    "longitude": 10.0,
    "aliases": [
      "Denmark",
      "Kingdom of Denmark"
    ],
    "featured": false,
    "sortOrder": 1056
  },
  {
    "key": "djibouti",
    "displayName": "Djibouti",
    "countryName": "Djibouti",
    "countryCode": "DJ",
    "flagEmoji": "🇩🇯",
    "latitude": 11.5,
    "longitude": 43.0,
    "aliases": [
      "Djibouti",
      "Republic of Djibouti"
    ],
    "featured": false,
    "sortOrder": 1057
  },
  {
    "key": "dominica",
    "displayName": "Dominica",
    "countryName": "Dominica",
    "countryCode": "DM",
    "flagEmoji": "🇩🇲",
    "latitude": 15.41666666,
    "longitude": -61.33333333,
    "aliases": [
      "Dominica",
      "Commonwealth of Dominica"
    ],
    "featured": false,
    "sortOrder": 1058
  },
  {
    "key": "dominican-republic",
    "displayName": "Dominican Republic",
    "countryName": "Dominican Republic",
    "countryCode": "DO",
    "flagEmoji": "🇩🇴",
    "latitude": 19.0,
    "longitude": -70.66666666,
    "aliases": [
      "Dominican Republic"
    ],
    "featured": false,
    "sortOrder": 1059
  },
  {
    "key": "ecuador",
    "displayName": "Ecuador",
    "countryName": "Ecuador",
    "countryCode": "EC",
    "flagEmoji": "🇪🇨",
    "latitude": -2.0,
    "longitude": -77.5,
    "aliases": [
      "Ecuador",
      "Republic of Ecuador"
    ],
    "featured": false,
    "sortOrder": 1060
  },
  {
    "key": "egypt",
    "displayName": "Egypt",
    "countryName": "Egypt",
    "countryCode": "EG",
    "flagEmoji": "🇪🇬",
    "latitude": 27.0,
    "longitude": 30.0,
    "aliases": [
      "Egypt",
      "Arab Republic of Egypt"
    ],
    "featured": false,
    "sortOrder": 1061
  },
  {
    "key": "el-salvador",
    "displayName": "El Salvador",
    "countryName": "El Salvador",
    "countryCode": "SV",
    "flagEmoji": "🇸🇻",
    "latitude": 13.83333333,
    "longitude": -88.91666666,
    "aliases": [
      "El Salvador",
      "Republic of El Salvador"
    ],
    "featured": false,
    "sortOrder": 1062
  },
  {
    "key": "equatorial-guinea",
    "displayName": "Equatorial Guinea",
    "countryName": "Equatorial Guinea",
    "countryCode": "GQ",
    "flagEmoji": "🇬🇶",
    "latitude": 2.0,
    "longitude": 10.0,
    "aliases": [
      "Equatorial Guinea",
      "Republic of Equatorial Guinea"
    ],
    "featured": false,
    "sortOrder": 1063
  },
  {
    "key": "eritrea",
    "displayName": "Eritrea",
    "countryName": "Eritrea",
    "countryCode": "ER",
    "flagEmoji": "🇪🇷",
    "latitude": 15.0,
    "longitude": 39.0,
    "aliases": [
      "Eritrea",
      "the State of Eritrea"
    ],
    "featured": false,
    "sortOrder": 1064
  },
  {
    "key": "estonia",
    "displayName": "Estonia",
    "countryName": "Estonia",
    "countryCode": "EE",
    "flagEmoji": "🇪🇪",
    "latitude": 59.0,
    "longitude": 26.0,
    "aliases": [
      "Estonia",
      "Republic of Estonia"
    ],
    "featured": false,
    "sortOrder": 1065
  },
  {
    "key": "eswatini",
    "displayName": "Eswatini",
    "countryName": "Eswatini",
    "countryCode": "SZ",
    "flagEmoji": "🇸🇿",
    "latitude": -26.5,
    "longitude": 31.5,
    "aliases": [
      "Eswatini",
      "Kingdom of Eswatini"
    ],
    "featured": false,
    "sortOrder": 1066
  },
  {
    "key": "ethiopia",
    "displayName": "Ethiopia",
    "countryName": "Ethiopia",
    "countryCode": "ET",
    "flagEmoji": "🇪🇹",
    "latitude": 8.0,
    "longitude": 38.0,
    "aliases": [
      "Ethiopia",
      "Federal Democratic Republic of Ethiopia"
    ],
    "featured": false,
    "sortOrder": 1067
  },
  {
    "key": "falkland-islands-malvinas",
    "displayName": "Falkland Islands (Malvinas)",
    "countryName": "Falkland Islands (Malvinas)",
    "countryCode": "FK",
    "flagEmoji": "🇫🇰",
    "latitude": -51.75,
    "longitude": -59.0,
    "aliases": [
      "Falkland Islands (Malvinas)"
    ],
    "featured": false,
    "sortOrder": 1068
  },
  {
    "key": "faroe-islands",
    "displayName": "Faroe Islands",
    "countryName": "Faroe Islands",
    "countryCode": "FO",
    "flagEmoji": "🇫🇴",
    "latitude": 62.0,
    "longitude": -7.0,
    "aliases": [
      "Faroe Islands"
    ],
    "featured": false,
    "sortOrder": 1069
  },
  {
    "key": "fiji",
    "displayName": "Fiji",
    "countryName": "Fiji",
    "countryCode": "FJ",
    "flagEmoji": "🇫🇯",
    "latitude": -18.0,
    "longitude": 175.0,
    "aliases": [
      "Fiji",
      "Republic of Fiji"
    ],
    "featured": false,
    "sortOrder": 1070
  },
  {
    "key": "finland",
    "displayName": "Finland",
    "countryName": "Finland",
    "countryCode": "FI",
    "flagEmoji": "🇫🇮",
    "latitude": 64.0,
    "longitude": 26.0,
    "aliases": [
      "Finland",
      "Republic of Finland"
    ],
    "featured": false,
    "sortOrder": 1071
  },
  {
    "key": "french-guiana",
    "displayName": "French Guiana",
    "countryName": "French Guiana",
    "countryCode": "GF",
    "flagEmoji": "🇬🇫",
    "latitude": 4.0,
    "longitude": -53.0,
    "aliases": [
      "French Guiana"
    ],
    "featured": false,
    "sortOrder": 1072
  },
  {
    "key": "french-polynesia",
    "displayName": "French Polynesia",
    "countryName": "French Polynesia",
    "countryCode": "PF",
    "flagEmoji": "🇵🇫",
    "latitude": -15.0,
    "longitude": -140.0,
    "aliases": [
      "French Polynesia"
    ],
    "featured": false,
    "sortOrder": 1073
  },
  {
    "key": "french-southern-territories",
    "displayName": "French Southern Territories",
    "countryName": "French Southern Territories",
    "countryCode": "TF",
    "flagEmoji": "🇹🇫",
    "latitude": -49.25,
    "longitude": 69.167,
    "aliases": [
      "French Southern Territories"
    ],
    "featured": false,
    "sortOrder": 1074
  },
  {
    "key": "gabon",
    "displayName": "Gabon",
    "countryName": "Gabon",
    "countryCode": "GA",
    "flagEmoji": "🇬🇦",
    "latitude": -1.0,
    "longitude": 11.75,
    "aliases": [
      "Gabon",
      "Gabonese Republic"
    ],
    "featured": false,
    "sortOrder": 1075
  },
  {
    "key": "gambia",
    "displayName": "Gambia",
    "countryName": "Gambia",
    "countryCode": "GM",
    "flagEmoji": "🇬🇲",
    "latitude": 13.46666666,
    "longitude": -16.56666666,
    "aliases": [
      "Gambia",
      "Republic of the Gambia"
    ],
    "featured": false,
    "sortOrder": 1076
  },
  {
    "key": "georgia",
    "displayName": "Georgia",
    "countryName": "Georgia",
    "countryCode": "GE",
    "flagEmoji": "🇬🇪",
    "latitude": 42.0,
    "longitude": 43.5,
    "aliases": [
      "Georgia"
    ],
    "featured": false,
    "sortOrder": 1077
  },
  {
    "key": "germany",
    "displayName": "Germany",
    "countryName": "Germany",
    "countryCode": "DE",
    "flagEmoji": "🇩🇪",
    "latitude": 51.0,
    "longitude": 9.0,
    "aliases": [
      "Germany",
      "Federal Republic of Germany"
    ],
    "featured": false,
    "sortOrder": 1078
  },
  {
    "key": "ghana",
    "displayName": "Ghana",
    "countryName": "Ghana",
    "countryCode": "GH",
    "flagEmoji": "🇬🇭",
    "latitude": 8.0,
    "longitude": -2.0,
    "aliases": [
      "Ghana",
      "Republic of Ghana"
    ],
    "featured": false,
    "sortOrder": 1079
  },
  {
    "key": "gibraltar",
    "displayName": "Gibraltar",
    "countryName": "Gibraltar",
    "countryCode": "GI",
    "flagEmoji": "🇬🇮",
    "latitude": 36.13333333,
    "longitude": -5.35,
    "aliases": [
      "Gibraltar"
    ],
    "featured": false,
    "sortOrder": 1080
  },
  {
    "key": "greece",
    "displayName": "Greece",
    "countryName": "Greece",
    "countryCode": "GR",
    "flagEmoji": "🇬🇷",
    "latitude": 39.0,
    "longitude": 22.0,
    "aliases": [
      "Greece",
      "Hellenic Republic"
    ],
    "featured": false,
    "sortOrder": 1081
  },
  {
    "key": "greenland",
    "displayName": "Greenland",
    "countryName": "Greenland",
    "countryCode": "GL",
    "flagEmoji": "🇬🇱",
    "latitude": 72.0,
    "longitude": -40.0,
    "aliases": [
      "Greenland"
    ],
    "featured": false,
    "sortOrder": 1082
  },
  {
    "key": "grenada",
    "displayName": "Grenada",
    "countryName": "Grenada",
    "countryCode": "GD",
    "flagEmoji": "🇬🇩",
    "latitude": 12.11666666,
    "longitude": -61.66666666,
    "aliases": [
      "Grenada"
    ],
    "featured": false,
    "sortOrder": 1083
  },
  {
    "key": "guadeloupe",
    "displayName": "Guadeloupe",
    "countryName": "Guadeloupe",
    "countryCode": "GP",
    "flagEmoji": "🇬🇵",
    "latitude": 16.25,
    "longitude": -61.583333,
    "aliases": [
      "Guadeloupe"
    ],
    "featured": false,
    "sortOrder": 1084
  },
  {
    "key": "guam",
    "displayName": "Guam",
    "countryName": "Guam",
    "countryCode": "GU",
    "flagEmoji": "🇬🇺",
    "latitude": 13.46666666,
    "longitude": 144.78333333,
    "aliases": [
      "Guam"
    ],
    "featured": false,
    "sortOrder": 1085
  },
  {
    "key": "guatemala",
    "displayName": "Guatemala",
    "countryName": "Guatemala",
    "countryCode": "GT",
    "flagEmoji": "🇬🇹",
    "latitude": 15.5,
    "longitude": -90.25,
    "aliases": [
      "Guatemala",
      "Republic of Guatemala"
    ],
    "featured": false,
    "sortOrder": 1086
  },
  {
    "key": "guernsey",
    "displayName": "Guernsey",
    "countryName": "Guernsey",
    "countryCode": "GG",
    "flagEmoji": "🇬🇬",
    "latitude": 49.46666666,
    "longitude": -2.58333333,
    "aliases": [
      "Guernsey"
    ],
    "featured": false,
    "sortOrder": 1087
  },
  {
    "key": "guinea",
    "displayName": "Guinea",
    "countryName": "Guinea",
    "countryCode": "GN",
    "flagEmoji": "🇬🇳",
    "latitude": 11.0,
    "longitude": -10.0,
    "aliases": [
      "Guinea",
      "Republic of Guinea"
    ],
    "featured": false,
    "sortOrder": 1088
  },
  {
    "key": "guinea-bissau",
    "displayName": "Guinea-Bissau",
    "countryName": "Guinea-Bissau",
    "countryCode": "GW",
    "flagEmoji": "🇬🇼",
    "latitude": 12.0,
    "longitude": -15.0,
    "aliases": [
      "Guinea-Bissau",
      "Republic of Guinea-Bissau"
    ],
    "featured": false,
    "sortOrder": 1089
  },
  {
    "key": "guyana",
    "displayName": "Guyana",
    "countryName": "Guyana",
    "countryCode": "GY",
    "flagEmoji": "🇬🇾",
    "latitude": 5.0,
    "longitude": -59.0,
    "aliases": [
      "Guyana",
      "Republic of Guyana"
    ],
    "featured": false,
    "sortOrder": 1090
  },
  {
    "key": "haiti",
    "displayName": "Haiti",
    "countryName": "Haiti",
    "countryCode": "HT",
    "flagEmoji": "🇭🇹",
    "latitude": 19.0,
    "longitude": -72.41666666,
    "aliases": [
      "Haiti",
      "Republic of Haiti"
    ],
    "featured": false,
    "sortOrder": 1091
  },
  {
    "key": "heard-island-and-mcdonald-islands",
    "displayName": "Heard Island and McDonald Islands",
    "countryName": "Heard Island and McDonald Islands",
    "countryCode": "HM",
    "flagEmoji": "🇭🇲",
    "latitude": -53.1,
    "longitude": 72.51666666,
    "aliases": [
      "Heard Island and McDonald Islands"
    ],
    "featured": false,
    "sortOrder": 1092
  },
  {
    "key": "holy-see-vatican-city-state",
    "displayName": "Holy See (Vatican City State)",
    "countryName": "Holy See (Vatican City State)",
    "countryCode": "VA",
    "flagEmoji": "🇻🇦",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Holy See (Vatican City State)"
    ],
    "featured": false,
    "sortOrder": 1093
  },
  {
    "key": "honduras",
    "displayName": "Honduras",
    "countryName": "Honduras",
    "countryCode": "HN",
    "flagEmoji": "🇭🇳",
    "latitude": 15.0,
    "longitude": -86.5,
    "aliases": [
      "Honduras",
      "Republic of Honduras"
    ],
    "featured": false,
    "sortOrder": 1094
  },
  {
    "key": "hong-kong",
    "displayName": "Hong Kong",
    "countryName": "Hong Kong",
    "countryCode": "HK",
    "flagEmoji": "🇭🇰",
    "latitude": 22.25,
    "longitude": 114.16666666,
    "aliases": [
      "Hong Kong",
      "Hong Kong Special Administrative Region of China"
    ],
    "featured": false,
    "sortOrder": 1095
  },
  {
    "key": "hungary",
    "displayName": "Hungary",
    "countryName": "Hungary",
    "countryCode": "HU",
    "flagEmoji": "🇭🇺",
    "latitude": 47.0,
    "longitude": 20.0,
    "aliases": [
      "Hungary"
    ],
    "featured": false,
    "sortOrder": 1096
  },
  {
    "key": "iceland",
    "displayName": "Iceland",
    "countryName": "Iceland",
    "countryCode": "IS",
    "flagEmoji": "🇮🇸",
    "latitude": 65.0,
    "longitude": -18.0,
    "aliases": [
      "Iceland",
      "Republic of Iceland"
    ],
    "featured": false,
    "sortOrder": 1097
  },
  {
    "key": "indonesia",
    "displayName": "Indonesia",
    "countryName": "Indonesia",
    "countryCode": "ID",
    "flagEmoji": "🇮🇩",
    "latitude": -5.0,
    "longitude": 120.0,
    "aliases": [
      "Indonesia",
      "Republic of Indonesia"
    ],
    "featured": false,
    "sortOrder": 1098
  },
  {
    "key": "iran-islamic-republic-of",
    "displayName": "Iran, Islamic Republic of",
    "countryName": "Iran, Islamic Republic of",
    "countryCode": "IR",
    "flagEmoji": "🇮🇷",
    "latitude": 32.0,
    "longitude": 53.0,
    "aliases": [
      "Iran, Islamic Republic of",
      "Islamic Republic of Iran",
      "Iran"
    ],
    "featured": false,
    "sortOrder": 1099
  },
  {
    "key": "iraq",
    "displayName": "Iraq",
    "countryName": "Iraq",
    "countryCode": "IQ",
    "flagEmoji": "🇮🇶",
    "latitude": 33.0,
    "longitude": 44.0,
    "aliases": [
      "Iraq",
      "Republic of Iraq"
    ],
    "featured": false,
    "sortOrder": 1100
  },
  {
    "key": "ireland",
    "displayName": "Ireland",
    "countryName": "Ireland",
    "countryCode": "IE",
    "flagEmoji": "🇮🇪",
    "latitude": 53.0,
    "longitude": -8.0,
    "aliases": [
      "Ireland"
    ],
    "featured": false,
    "sortOrder": 1101
  },
  {
    "key": "isle-of-man",
    "displayName": "Isle of Man",
    "countryName": "Isle of Man",
    "countryCode": "IM",
    "flagEmoji": "🇮🇲",
    "latitude": 54.25,
    "longitude": -4.5,
    "aliases": [
      "Isle of Man"
    ],
    "featured": false,
    "sortOrder": 1102
  },
  {
    "key": "israel",
    "displayName": "Israel",
    "countryName": "Israel",
    "countryCode": "IL",
    "flagEmoji": "🇮🇱",
    "latitude": 31.5,
    "longitude": 34.75,
    "aliases": [
      "Israel",
      "State of Israel"
    ],
    "featured": false,
    "sortOrder": 1103
  },
  {
    "key": "jamaica",
    "displayName": "Jamaica",
    "countryName": "Jamaica",
    "countryCode": "JM",
    "flagEmoji": "🇯🇲",
    "latitude": 18.25,
    "longitude": -77.5,
    "aliases": [
      "Jamaica"
    ],
    "featured": false,
    "sortOrder": 1104
  },
  {
    "key": "jersey",
    "displayName": "Jersey",
    "countryName": "Jersey",
    "countryCode": "JE",
    "flagEmoji": "🇯🇪",
    "latitude": 49.25,
    "longitude": -2.16666666,
    "aliases": [
      "Jersey"
    ],
    "featured": false,
    "sortOrder": 1105
  },
  {
    "key": "jordan",
    "displayName": "Jordan",
    "countryName": "Jordan",
    "countryCode": "JO",
    "flagEmoji": "🇯🇴",
    "latitude": 31.0,
    "longitude": 36.0,
    "aliases": [
      "Jordan",
      "Hashemite Kingdom of Jordan"
    ],
    "featured": false,
    "sortOrder": 1106
  },
  {
    "key": "kazakhstan",
    "displayName": "Kazakhstan",
    "countryName": "Kazakhstan",
    "countryCode": "KZ",
    "flagEmoji": "🇰🇿",
    "latitude": 48.0,
    "longitude": 68.0,
    "aliases": [
      "Kazakhstan",
      "Republic of Kazakhstan"
    ],
    "featured": false,
    "sortOrder": 1107
  },
  {
    "key": "kenya",
    "displayName": "Kenya",
    "countryName": "Kenya",
    "countryCode": "KE",
    "flagEmoji": "🇰🇪",
    "latitude": 1.0,
    "longitude": 38.0,
    "aliases": [
      "Kenya",
      "Republic of Kenya"
    ],
    "featured": false,
    "sortOrder": 1108
  },
  {
    "key": "kiribati",
    "displayName": "Kiribati",
    "countryName": "Kiribati",
    "countryCode": "KI",
    "flagEmoji": "🇰🇮",
    "latitude": 1.41666666,
    "longitude": 173.0,
    "aliases": [
      "Kiribati",
      "Republic of Kiribati"
    ],
    "featured": false,
    "sortOrder": 1109
  },
  {
    "key": "korea-democratic-people-s-republic-of",
    "displayName": "Korea, Democratic People's Republic of",
    "countryName": "Korea, Democratic People's Republic of",
    "countryCode": "KP",
    "flagEmoji": "🇰🇵",
    "latitude": 40.0,
    "longitude": 127.0,
    "aliases": [
      "Korea, Democratic People's Republic of",
      "Democratic People's Republic of Korea",
      "North Korea"
    ],
    "featured": false,
    "sortOrder": 1110
  },
  {
    "key": "kuwait",
    "displayName": "Kuwait",
    "countryName": "Kuwait",
    "countryCode": "KW",
    "flagEmoji": "🇰🇼",
    "latitude": 29.5,
    "longitude": 45.75,
    "aliases": [
      "Kuwait",
      "State of Kuwait"
    ],
    "featured": false,
    "sortOrder": 1111
  },
  {
    "key": "kyrgyzstan",
    "displayName": "Kyrgyzstan",
    "countryName": "Kyrgyzstan",
    "countryCode": "KG",
    "flagEmoji": "🇰🇬",
    "latitude": 41.0,
    "longitude": 75.0,
    "aliases": [
      "Kyrgyzstan",
      "Kyrgyz Republic"
    ],
    "featured": false,
    "sortOrder": 1112
  },
  {
    "key": "lao-people-s-democratic-republic",
    "displayName": "Lao People's Democratic Republic",
    "countryName": "Lao People's Democratic Republic",
    "countryCode": "LA",
    "flagEmoji": "🇱🇦",
    "latitude": 18.0,
    "longitude": 105.0,
    "aliases": [
      "Lao People's Democratic Republic",
      "Laos"
    ],
    "featured": false,
    "sortOrder": 1113
  },
  {
    "key": "latvia",
    "displayName": "Latvia",
    "countryName": "Latvia",
    "countryCode": "LV",
    "flagEmoji": "🇱🇻",
    "latitude": 57.0,
    "longitude": 25.0,
    "aliases": [
      "Latvia",
      "Republic of Latvia"
    ],
    "featured": false,
    "sortOrder": 1114
  },
  {
    "key": "lebanon",
    "displayName": "Lebanon",
    "countryName": "Lebanon",
    "countryCode": "LB",
    "flagEmoji": "🇱🇧",
    "latitude": 33.83333333,
    "longitude": 35.83333333,
    "aliases": [
      "Lebanon",
      "Lebanese Republic"
    ],
    "featured": false,
    "sortOrder": 1115
  },
  {
    "key": "lesotho",
    "displayName": "Lesotho",
    "countryName": "Lesotho",
    "countryCode": "LS",
    "flagEmoji": "🇱🇸",
    "latitude": -29.5,
    "longitude": 28.5,
    "aliases": [
      "Lesotho",
      "Kingdom of Lesotho"
    ],
    "featured": false,
    "sortOrder": 1116
  },
  {
    "key": "liberia",
    "displayName": "Liberia",
    "countryName": "Liberia",
    "countryCode": "LR",
    "flagEmoji": "🇱🇷",
    "latitude": 6.5,
    "longitude": -9.5,
    "aliases": [
      "Liberia",
      "Republic of Liberia"
    ],
    "featured": false,
    "sortOrder": 1117
  },
  {
    "key": "libya",
    "displayName": "Libya",
    "countryName": "Libya",
    "countryCode": "LY",
    "flagEmoji": "🇱🇾",
    "latitude": 25.0,
    "longitude": 17.0,
    "aliases": [
      "Libya"
    ],
    "featured": false,
    "sortOrder": 1118
  },
  {
    "key": "liechtenstein",
    "displayName": "Liechtenstein",
    "countryName": "Liechtenstein",
    "countryCode": "LI",
    "flagEmoji": "🇱🇮",
    "latitude": 47.26666666,
    "longitude": 9.53333333,
    "aliases": [
      "Liechtenstein",
      "Principality of Liechtenstein"
    ],
    "featured": false,
    "sortOrder": 1119
  },
  {
    "key": "lithuania",
    "displayName": "Lithuania",
    "countryName": "Lithuania",
    "countryCode": "LT",
    "flagEmoji": "🇱🇹",
    "latitude": 56.0,
    "longitude": 24.0,
    "aliases": [
      "Lithuania",
      "Republic of Lithuania"
    ],
    "featured": false,
    "sortOrder": 1120
  },
  {
    "key": "luxembourg",
    "displayName": "Luxembourg",
    "countryName": "Luxembourg",
    "countryCode": "LU",
    "flagEmoji": "🇱🇺",
    "latitude": 49.75,
    "longitude": 6.16666666,
    "aliases": [
      "Luxembourg",
      "Grand Duchy of Luxembourg"
    ],
    "featured": false,
    "sortOrder": 1121
  },
  {
    "key": "macao",
    "displayName": "Macao",
    "countryName": "Macao",
    "countryCode": "MO",
    "flagEmoji": "🇲🇴",
    "latitude": 22.16666666,
    "longitude": 113.55,
    "aliases": [
      "Macao",
      "Macao Special Administrative Region of China"
    ],
    "featured": false,
    "sortOrder": 1122
  },
  {
    "key": "madagascar",
    "displayName": "Madagascar",
    "countryName": "Madagascar",
    "countryCode": "MG",
    "flagEmoji": "🇲🇬",
    "latitude": -20.0,
    "longitude": 47.0,
    "aliases": [
      "Madagascar",
      "Republic of Madagascar"
    ],
    "featured": false,
    "sortOrder": 1123
  },
  {
    "key": "malawi",
    "displayName": "Malawi",
    "countryName": "Malawi",
    "countryCode": "MW",
    "flagEmoji": "🇲🇼",
    "latitude": -13.5,
    "longitude": 34.0,
    "aliases": [
      "Malawi",
      "Republic of Malawi"
    ],
    "featured": false,
    "sortOrder": 1124
  },
  {
    "key": "malaysia",
    "displayName": "Malaysia",
    "countryName": "Malaysia",
    "countryCode": "MY",
    "flagEmoji": "🇲🇾",
    "latitude": 2.5,
    "longitude": 112.5,
    "aliases": [
      "Malaysia"
    ],
    "featured": false,
    "sortOrder": 1125
  },
  {
    "key": "maldives",
    "displayName": "Maldives",
    "countryName": "Maldives",
    "countryCode": "MV",
    "flagEmoji": "🇲🇻",
    "latitude": 3.25,
    "longitude": 73.0,
    "aliases": [
      "Maldives",
      "Republic of Maldives"
    ],
    "featured": false,
    "sortOrder": 1126
  },
  {
    "key": "mali",
    "displayName": "Mali",
    "countryName": "Mali",
    "countryCode": "ML",
    "flagEmoji": "🇲🇱",
    "latitude": 17.0,
    "longitude": -4.0,
    "aliases": [
      "Mali",
      "Republic of Mali"
    ],
    "featured": false,
    "sortOrder": 1127
  },
  {
    "key": "malta",
    "displayName": "Malta",
    "countryName": "Malta",
    "countryCode": "MT",
    "flagEmoji": "🇲🇹",
    "latitude": 35.83333333,
    "longitude": 14.58333333,
    "aliases": [
      "Malta",
      "Republic of Malta"
    ],
    "featured": false,
    "sortOrder": 1128
  },
  {
    "key": "marshall-islands",
    "displayName": "Marshall Islands",
    "countryName": "Marshall Islands",
    "countryCode": "MH",
    "flagEmoji": "🇲🇭",
    "latitude": 9.0,
    "longitude": 168.0,
    "aliases": [
      "Marshall Islands",
      "Republic of the Marshall Islands"
    ],
    "featured": false,
    "sortOrder": 1129
  },
  {
    "key": "martinique",
    "displayName": "Martinique",
    "countryName": "Martinique",
    "countryCode": "MQ",
    "flagEmoji": "🇲🇶",
    "latitude": 14.666667,
    "longitude": -61.0,
    "aliases": [
      "Martinique"
    ],
    "featured": false,
    "sortOrder": 1130
  },
  {
    "key": "mauritania",
    "displayName": "Mauritania",
    "countryName": "Mauritania",
    "countryCode": "MR",
    "flagEmoji": "🇲🇷",
    "latitude": 20.0,
    "longitude": -12.0,
    "aliases": [
      "Mauritania",
      "Islamic Republic of Mauritania"
    ],
    "featured": false,
    "sortOrder": 1131
  },
  {
    "key": "mauritius",
    "displayName": "Mauritius",
    "countryName": "Mauritius",
    "countryCode": "MU",
    "flagEmoji": "🇲🇺",
    "latitude": -20.28333333,
    "longitude": 57.55,
    "aliases": [
      "Mauritius",
      "Republic of Mauritius"
    ],
    "featured": false,
    "sortOrder": 1132
  },
  {
    "key": "mayotte",
    "displayName": "Mayotte",
    "countryName": "Mayotte",
    "countryCode": "YT",
    "flagEmoji": "🇾🇹",
    "latitude": -12.83333333,
    "longitude": 45.16666666,
    "aliases": [
      "Mayotte"
    ],
    "featured": false,
    "sortOrder": 1133
  },
  {
    "key": "micronesia-federated-states-of",
    "displayName": "Micronesia, Federated States of",
    "countryName": "Micronesia, Federated States of",
    "countryCode": "FM",
    "flagEmoji": "🇫🇲",
    "latitude": 6.91666666,
    "longitude": 158.25,
    "aliases": [
      "Micronesia, Federated States of",
      "Federated States of Micronesia"
    ],
    "featured": false,
    "sortOrder": 1134
  },
  {
    "key": "moldova-republic-of",
    "displayName": "Moldova, Republic of",
    "countryName": "Moldova, Republic of",
    "countryCode": "MD",
    "flagEmoji": "🇲🇩",
    "latitude": 47.0,
    "longitude": 29.0,
    "aliases": [
      "Moldova, Republic of",
      "Republic of Moldova",
      "Moldova"
    ],
    "featured": false,
    "sortOrder": 1135
  },
  {
    "key": "monaco",
    "displayName": "Monaco",
    "countryName": "Monaco",
    "countryCode": "MC",
    "flagEmoji": "🇲🇨",
    "latitude": 43.73333333,
    "longitude": 7.4,
    "aliases": [
      "Monaco",
      "Principality of Monaco"
    ],
    "featured": false,
    "sortOrder": 1136
  },
  {
    "key": "mongolia",
    "displayName": "Mongolia",
    "countryName": "Mongolia",
    "countryCode": "MN",
    "flagEmoji": "🇲🇳",
    "latitude": 46.0,
    "longitude": 105.0,
    "aliases": [
      "Mongolia"
    ],
    "featured": false,
    "sortOrder": 1137
  },
  {
    "key": "montenegro",
    "displayName": "Montenegro",
    "countryName": "Montenegro",
    "countryCode": "ME",
    "flagEmoji": "🇲🇪",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Montenegro"
    ],
    "featured": false,
    "sortOrder": 1138
  },
  {
    "key": "montserrat",
    "displayName": "Montserrat",
    "countryName": "Montserrat",
    "countryCode": "MS",
    "flagEmoji": "🇲🇸",
    "latitude": 16.75,
    "longitude": -62.2,
    "aliases": [
      "Montserrat"
    ],
    "featured": false,
    "sortOrder": 1139
  },
  {
    "key": "morocco",
    "displayName": "Morocco",
    "countryName": "Morocco",
    "countryCode": "MA",
    "flagEmoji": "🇲🇦",
    "latitude": 32.0,
    "longitude": -5.0,
    "aliases": [
      "Morocco",
      "Kingdom of Morocco"
    ],
    "featured": false,
    "sortOrder": 1140
  },
  {
    "key": "mozambique",
    "displayName": "Mozambique",
    "countryName": "Mozambique",
    "countryCode": "MZ",
    "flagEmoji": "🇲🇿",
    "latitude": -18.25,
    "longitude": 35.0,
    "aliases": [
      "Mozambique",
      "Republic of Mozambique"
    ],
    "featured": false,
    "sortOrder": 1141
  },
  {
    "key": "myanmar",
    "displayName": "Myanmar",
    "countryName": "Myanmar",
    "countryCode": "MM",
    "flagEmoji": "🇲🇲",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Myanmar",
      "Republic of Myanmar"
    ],
    "featured": false,
    "sortOrder": 1142
  },
  {
    "key": "namibia",
    "displayName": "Namibia",
    "countryName": "Namibia",
    "countryCode": "NA",
    "flagEmoji": "🇳🇦",
    "latitude": -22.0,
    "longitude": 17.0,
    "aliases": [
      "Namibia",
      "Republic of Namibia"
    ],
    "featured": false,
    "sortOrder": 1143
  },
  {
    "key": "nauru",
    "displayName": "Nauru",
    "countryName": "Nauru",
    "countryCode": "NR",
    "flagEmoji": "🇳🇷",
    "latitude": -0.53333333,
    "longitude": 166.91666666,
    "aliases": [
      "Nauru",
      "Republic of Nauru"
    ],
    "featured": false,
    "sortOrder": 1144
  },
  {
    "key": "nepal",
    "displayName": "Nepal",
    "countryName": "Nepal",
    "countryCode": "NP",
    "flagEmoji": "🇳🇵",
    "latitude": 28.0,
    "longitude": 84.0,
    "aliases": [
      "Nepal",
      "Federal Democratic Republic of Nepal"
    ],
    "featured": false,
    "sortOrder": 1145
  },
  {
    "key": "netherlands",
    "displayName": "Netherlands",
    "countryName": "Netherlands",
    "countryCode": "NL",
    "flagEmoji": "🇳🇱",
    "latitude": 52.5,
    "longitude": 5.75,
    "aliases": [
      "Netherlands",
      "Kingdom of the Netherlands"
    ],
    "featured": false,
    "sortOrder": 1146
  },
  {
    "key": "new-caledonia",
    "displayName": "New Caledonia",
    "countryName": "New Caledonia",
    "countryCode": "NC",
    "flagEmoji": "🇳🇨",
    "latitude": -21.5,
    "longitude": 165.5,
    "aliases": [
      "New Caledonia"
    ],
    "featured": false,
    "sortOrder": 1147
  },
  {
    "key": "new-zealand",
    "displayName": "New Zealand",
    "countryName": "New Zealand",
    "countryCode": "NZ",
    "flagEmoji": "🇳🇿",
    "latitude": -41.0,
    "longitude": 174.0,
    "aliases": [
      "New Zealand"
    ],
    "featured": false,
    "sortOrder": 1148
  },
  {
    "key": "nicaragua",
    "displayName": "Nicaragua",
    "countryName": "Nicaragua",
    "countryCode": "NI",
    "flagEmoji": "🇳🇮",
    "latitude": 13.0,
    "longitude": -85.0,
    "aliases": [
      "Nicaragua",
      "Republic of Nicaragua"
    ],
    "featured": false,
    "sortOrder": 1149
  },
  {
    "key": "niger",
    "displayName": "Niger",
    "countryName": "Niger",
    "countryCode": "NE",
    "flagEmoji": "🇳🇪",
    "latitude": 16.0,
    "longitude": 8.0,
    "aliases": [
      "Niger",
      "Republic of the Niger"
    ],
    "featured": false,
    "sortOrder": 1150
  },
  {
    "key": "nigeria",
    "displayName": "Nigeria",
    "countryName": "Nigeria",
    "countryCode": "NG",
    "flagEmoji": "🇳🇬",
    "latitude": 10.0,
    "longitude": 8.0,
    "aliases": [
      "Nigeria",
      "Federal Republic of Nigeria"
    ],
    "featured": false,
    "sortOrder": 1151
  },
  {
    "key": "niue",
    "displayName": "Niue",
    "countryName": "Niue",
    "countryCode": "NU",
    "flagEmoji": "🇳🇺",
    "latitude": -19.03333333,
    "longitude": -169.86666666,
    "aliases": [
      "Niue"
    ],
    "featured": false,
    "sortOrder": 1152
  },
  {
    "key": "norfolk-island",
    "displayName": "Norfolk Island",
    "countryName": "Norfolk Island",
    "countryCode": "NF",
    "flagEmoji": "🇳🇫",
    "latitude": -29.03333333,
    "longitude": 167.95,
    "aliases": [
      "Norfolk Island"
    ],
    "featured": false,
    "sortOrder": 1153
  },
  {
    "key": "north-macedonia",
    "displayName": "North Macedonia",
    "countryName": "North Macedonia",
    "countryCode": "MK",
    "flagEmoji": "🇲🇰",
    "latitude": 41.83333333,
    "longitude": 22.0,
    "aliases": [
      "North Macedonia",
      "Republic of North Macedonia"
    ],
    "featured": false,
    "sortOrder": 1154
  },
  {
    "key": "northern-mariana-islands",
    "displayName": "Northern Mariana Islands",
    "countryName": "Northern Mariana Islands",
    "countryCode": "MP",
    "flagEmoji": "🇲🇵",
    "latitude": 15.2,
    "longitude": 145.75,
    "aliases": [
      "Northern Mariana Islands",
      "Commonwealth of the Northern Mariana Islands"
    ],
    "featured": false,
    "sortOrder": 1155
  },
  {
    "key": "norway",
    "displayName": "Norway",
    "countryName": "Norway",
    "countryCode": "NO",
    "flagEmoji": "🇳🇴",
    "latitude": 62.0,
    "longitude": 10.0,
    "aliases": [
      "Norway",
      "Kingdom of Norway"
    ],
    "featured": false,
    "sortOrder": 1156
  },
  {
    "key": "oman",
    "displayName": "Oman",
    "countryName": "Oman",
    "countryCode": "OM",
    "flagEmoji": "🇴🇲",
    "latitude": 21.0,
    "longitude": 57.0,
    "aliases": [
      "Oman",
      "Sultanate of Oman"
    ],
    "featured": false,
    "sortOrder": 1157
  },
  {
    "key": "pakistan",
    "displayName": "Pakistan",
    "countryName": "Pakistan",
    "countryCode": "PK",
    "flagEmoji": "🇵🇰",
    "latitude": 30.0,
    "longitude": 70.0,
    "aliases": [
      "Pakistan",
      "Islamic Republic of Pakistan"
    ],
    "featured": false,
    "sortOrder": 1158
  },
  {
    "key": "palau",
    "displayName": "Palau",
    "countryName": "Palau",
    "countryCode": "PW",
    "flagEmoji": "🇵🇼",
    "latitude": 7.5,
    "longitude": 134.5,
    "aliases": [
      "Palau",
      "Republic of Palau"
    ],
    "featured": false,
    "sortOrder": 1159
  },
  {
    "key": "palestine-state-of",
    "displayName": "Palestine, State of",
    "countryName": "Palestine, State of",
    "countryCode": "PS",
    "flagEmoji": "🇵🇸",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Palestine, State of",
      "the State of Palestine"
    ],
    "featured": false,
    "sortOrder": 1160
  },
  {
    "key": "panama",
    "displayName": "Panama",
    "countryName": "Panama",
    "countryCode": "PA",
    "flagEmoji": "🇵🇦",
    "latitude": 9.0,
    "longitude": -80.0,
    "aliases": [
      "Panama",
      "Republic of Panama"
    ],
    "featured": false,
    "sortOrder": 1161
  },
  {
    "key": "papua-new-guinea",
    "displayName": "Papua New Guinea",
    "countryName": "Papua New Guinea",
    "countryCode": "PG",
    "flagEmoji": "🇵🇬",
    "latitude": -6.0,
    "longitude": 147.0,
    "aliases": [
      "Papua New Guinea",
      "Independent State of Papua New Guinea"
    ],
    "featured": false,
    "sortOrder": 1162
  },
  {
    "key": "paraguay",
    "displayName": "Paraguay",
    "countryName": "Paraguay",
    "countryCode": "PY",
    "flagEmoji": "🇵🇾",
    "latitude": -23.0,
    "longitude": -58.0,
    "aliases": [
      "Paraguay",
      "Republic of Paraguay"
    ],
    "featured": false,
    "sortOrder": 1163
  },
  {
    "key": "peru",
    "displayName": "Peru",
    "countryName": "Peru",
    "countryCode": "PE",
    "flagEmoji": "🇵🇪",
    "latitude": -10.0,
    "longitude": -76.0,
    "aliases": [
      "Peru",
      "Republic of Peru"
    ],
    "featured": false,
    "sortOrder": 1164
  },
  {
    "key": "philippines",
    "displayName": "Philippines",
    "countryName": "Philippines",
    "countryCode": "PH",
    "flagEmoji": "🇵🇭",
    "latitude": 13.0,
    "longitude": 122.0,
    "aliases": [
      "Philippines",
      "Republic of the Philippines"
    ],
    "featured": false,
    "sortOrder": 1165
  },
  {
    "key": "pitcairn",
    "displayName": "Pitcairn",
    "countryName": "Pitcairn",
    "countryCode": "PN",
    "flagEmoji": "🇵🇳",
    "latitude": -25.06666666,
    "longitude": -130.1,
    "aliases": [
      "Pitcairn"
    ],
    "featured": false,
    "sortOrder": 1166
  },
  {
    "key": "poland",
    "displayName": "Poland",
    "countryName": "Poland",
    "countryCode": "PL",
    "flagEmoji": "🇵🇱",
    "latitude": 52.0,
    "longitude": 20.0,
    "aliases": [
      "Poland",
      "Republic of Poland"
    ],
    "featured": false,
    "sortOrder": 1167
  },
  {
    "key": "portugal",
    "displayName": "Portugal",
    "countryName": "Portugal",
    "countryCode": "PT",
    "flagEmoji": "🇵🇹",
    "latitude": 39.5,
    "longitude": -8.0,
    "aliases": [
      "Portugal",
      "Portuguese Republic"
    ],
    "featured": false,
    "sortOrder": 1168
  },
  {
    "key": "puerto-rico",
    "displayName": "Puerto Rico",
    "countryName": "Puerto Rico",
    "countryCode": "PR",
    "flagEmoji": "🇵🇷",
    "latitude": 18.25,
    "longitude": -66.5,
    "aliases": [
      "Puerto Rico"
    ],
    "featured": false,
    "sortOrder": 1169
  },
  {
    "key": "qatar",
    "displayName": "Qatar",
    "countryName": "Qatar",
    "countryCode": "QA",
    "flagEmoji": "🇶🇦",
    "latitude": 25.5,
    "longitude": 51.25,
    "aliases": [
      "Qatar",
      "State of Qatar"
    ],
    "featured": false,
    "sortOrder": 1170
  },
  {
    "key": "romania",
    "displayName": "Romania",
    "countryName": "Romania",
    "countryCode": "RO",
    "flagEmoji": "🇷🇴",
    "latitude": 46.0,
    "longitude": 25.0,
    "aliases": [
      "Romania"
    ],
    "featured": false,
    "sortOrder": 1171
  },
  {
    "key": "rwanda",
    "displayName": "Rwanda",
    "countryName": "Rwanda",
    "countryCode": "RW",
    "flagEmoji": "🇷🇼",
    "latitude": -2.0,
    "longitude": 30.0,
    "aliases": [
      "Rwanda",
      "Rwandese Republic"
    ],
    "featured": false,
    "sortOrder": 1172
  },
  {
    "key": "r-union",
    "displayName": "Réunion",
    "countryName": "Réunion",
    "countryCode": "RE",
    "flagEmoji": "🇷🇪",
    "latitude": -21.15,
    "longitude": 55.5,
    "aliases": [
      "Réunion"
    ],
    "featured": false,
    "sortOrder": 1173
  },
  {
    "key": "saint-barth-lemy",
    "displayName": "Saint Barthélemy",
    "countryName": "Saint Barthélemy",
    "countryCode": "BL",
    "flagEmoji": "🇧🇱",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Saint Barthélemy"
    ],
    "featured": false,
    "sortOrder": 1174
  },
  {
    "key": "saint-helena-ascension-and-tristan-da-cunha",
    "displayName": "Saint Helena, Ascension and Tristan da Cunha",
    "countryName": "Saint Helena, Ascension and Tristan da Cunha",
    "countryCode": "SH",
    "flagEmoji": "🇸🇭",
    "latitude": -15.95,
    "longitude": -5.7,
    "aliases": [
      "Saint Helena, Ascension and Tristan da Cunha"
    ],
    "featured": false,
    "sortOrder": 1175
  },
  {
    "key": "saint-kitts-and-nevis",
    "displayName": "Saint Kitts and Nevis",
    "countryName": "Saint Kitts and Nevis",
    "countryCode": "KN",
    "flagEmoji": "🇰🇳",
    "latitude": 17.33333333,
    "longitude": -62.75,
    "aliases": [
      "Saint Kitts and Nevis"
    ],
    "featured": false,
    "sortOrder": 1176
  },
  {
    "key": "saint-lucia",
    "displayName": "Saint Lucia",
    "countryName": "Saint Lucia",
    "countryCode": "LC",
    "flagEmoji": "🇱🇨",
    "latitude": 13.88333333,
    "longitude": -60.96666666,
    "aliases": [
      "Saint Lucia"
    ],
    "featured": false,
    "sortOrder": 1177
  },
  {
    "key": "saint-martin-french-part",
    "displayName": "Saint Martin (French part)",
    "countryName": "Saint Martin (French part)",
    "countryCode": "MF",
    "flagEmoji": "🇲🇫",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Saint Martin (French part)"
    ],
    "featured": false,
    "sortOrder": 1178
  },
  {
    "key": "saint-pierre-and-miquelon",
    "displayName": "Saint Pierre and Miquelon",
    "countryName": "Saint Pierre and Miquelon",
    "countryCode": "PM",
    "flagEmoji": "🇵🇲",
    "latitude": 46.83333333,
    "longitude": -56.33333333,
    "aliases": [
      "Saint Pierre and Miquelon"
    ],
    "featured": false,
    "sortOrder": 1179
  },
  {
    "key": "saint-vincent-and-the-grenadines",
    "displayName": "Saint Vincent and the Grenadines",
    "countryName": "Saint Vincent and the Grenadines",
    "countryCode": "VC",
    "flagEmoji": "🇻🇨",
    "latitude": 13.25,
    "longitude": -61.2,
    "aliases": [
      "Saint Vincent and the Grenadines"
    ],
    "featured": false,
    "sortOrder": 1180
  },
  {
    "key": "samoa",
    "displayName": "Samoa",
    "countryName": "Samoa",
    "countryCode": "WS",
    "flagEmoji": "🇼🇸",
    "latitude": -13.58333333,
    "longitude": -172.33333333,
    "aliases": [
      "Samoa",
      "Independent State of Samoa"
    ],
    "featured": false,
    "sortOrder": 1181
  },
  {
    "key": "san-marino",
    "displayName": "San Marino",
    "countryName": "San Marino",
    "countryCode": "SM",
    "flagEmoji": "🇸🇲",
    "latitude": 43.76666666,
    "longitude": 12.41666666,
    "aliases": [
      "San Marino",
      "Republic of San Marino"
    ],
    "featured": false,
    "sortOrder": 1182
  },
  {
    "key": "sao-tome-and-principe",
    "displayName": "Sao Tome and Principe",
    "countryName": "Sao Tome and Principe",
    "countryCode": "ST",
    "flagEmoji": "🇸🇹",
    "latitude": 1.0,
    "longitude": 7.0,
    "aliases": [
      "Sao Tome and Principe",
      "Democratic Republic of Sao Tome and Principe"
    ],
    "featured": false,
    "sortOrder": 1183
  },
  {
    "key": "saudi-arabia",
    "displayName": "Saudi Arabia",
    "countryName": "Saudi Arabia",
    "countryCode": "SA",
    "flagEmoji": "🇸🇦",
    "latitude": 25.0,
    "longitude": 45.0,
    "aliases": [
      "Saudi Arabia",
      "Kingdom of Saudi Arabia"
    ],
    "featured": false,
    "sortOrder": 1184
  },
  {
    "key": "senegal",
    "displayName": "Senegal",
    "countryName": "Senegal",
    "countryCode": "SN",
    "flagEmoji": "🇸🇳",
    "latitude": 14.0,
    "longitude": -14.0,
    "aliases": [
      "Senegal",
      "Republic of Senegal"
    ],
    "featured": false,
    "sortOrder": 1185
  },
  {
    "key": "serbia",
    "displayName": "Serbia",
    "countryName": "Serbia",
    "countryCode": "RS",
    "flagEmoji": "🇷🇸",
    "latitude": 44.1305021,
    "longitude": 16.4284181,
    "aliases": [
      "Serbia",
      "Republic of Serbia"
    ],
    "featured": false,
    "sortOrder": 1186
  },
  {
    "key": "seychelles",
    "displayName": "Seychelles",
    "countryName": "Seychelles",
    "countryCode": "SC",
    "flagEmoji": "🇸🇨",
    "latitude": -4.58333333,
    "longitude": 55.66666666,
    "aliases": [
      "Seychelles",
      "Republic of Seychelles"
    ],
    "featured": false,
    "sortOrder": 1187
  },
  {
    "key": "sierra-leone",
    "displayName": "Sierra Leone",
    "countryName": "Sierra Leone",
    "countryCode": "SL",
    "flagEmoji": "🇸🇱",
    "latitude": 8.5,
    "longitude": -11.5,
    "aliases": [
      "Sierra Leone",
      "Republic of Sierra Leone"
    ],
    "featured": false,
    "sortOrder": 1188
  },
  {
    "key": "singapore",
    "displayName": "Singapore",
    "countryName": "Singapore",
    "countryCode": "SG",
    "flagEmoji": "🇸🇬",
    "latitude": 1.36666666,
    "longitude": 103.8,
    "aliases": [
      "Singapore",
      "Republic of Singapore"
    ],
    "featured": false,
    "sortOrder": 1189
  },
  {
    "key": "sint-maarten-dutch-part",
    "displayName": "Sint Maarten (Dutch part)",
    "countryName": "Sint Maarten (Dutch part)",
    "countryCode": "SX",
    "flagEmoji": "🇸🇽",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Sint Maarten (Dutch part)"
    ],
    "featured": false,
    "sortOrder": 1190
  },
  {
    "key": "slovakia",
    "displayName": "Slovakia",
    "countryName": "Slovakia",
    "countryCode": "SK",
    "flagEmoji": "🇸🇰",
    "latitude": 48.66666666,
    "longitude": 19.5,
    "aliases": [
      "Slovakia",
      "Slovak Republic"
    ],
    "featured": false,
    "sortOrder": 1191
  },
  {
    "key": "slovenia",
    "displayName": "Slovenia",
    "countryName": "Slovenia",
    "countryCode": "SI",
    "flagEmoji": "🇸🇮",
    "latitude": 46.11666666,
    "longitude": 14.81666666,
    "aliases": [
      "Slovenia",
      "Republic of Slovenia"
    ],
    "featured": false,
    "sortOrder": 1192
  },
  {
    "key": "solomon-islands",
    "displayName": "Solomon Islands",
    "countryName": "Solomon Islands",
    "countryCode": "SB",
    "flagEmoji": "🇸🇧",
    "latitude": -8.0,
    "longitude": 159.0,
    "aliases": [
      "Solomon Islands"
    ],
    "featured": false,
    "sortOrder": 1193
  },
  {
    "key": "somalia",
    "displayName": "Somalia",
    "countryName": "Somalia",
    "countryCode": "SO",
    "flagEmoji": "🇸🇴",
    "latitude": 10.0,
    "longitude": 49.0,
    "aliases": [
      "Somalia",
      "Federal Republic of Somalia"
    ],
    "featured": false,
    "sortOrder": 1194
  },
  {
    "key": "south-africa",
    "displayName": "South Africa",
    "countryName": "South Africa",
    "countryCode": "ZA",
    "flagEmoji": "🇿🇦",
    "latitude": -29.0,
    "longitude": 24.0,
    "aliases": [
      "South Africa",
      "Republic of South Africa"
    ],
    "featured": false,
    "sortOrder": 1195
  },
  {
    "key": "south-georgia-and-the-south-sandwich-islands",
    "displayName": "South Georgia and the South Sandwich Islands",
    "countryName": "South Georgia and the South Sandwich Islands",
    "countryCode": "GS",
    "flagEmoji": "🇬🇸",
    "latitude": -54.5,
    "longitude": -37.0,
    "aliases": [
      "South Georgia and the South Sandwich Islands"
    ],
    "featured": false,
    "sortOrder": 1196
  },
  {
    "key": "south-sudan",
    "displayName": "South Sudan",
    "countryName": "South Sudan",
    "countryCode": "SS",
    "flagEmoji": "🇸🇸",
    "latitude": 7.0,
    "longitude": 30.0,
    "aliases": [
      "South Sudan",
      "Republic of South Sudan"
    ],
    "featured": false,
    "sortOrder": 1197
  },
  {
    "key": "sri-lanka",
    "displayName": "Sri Lanka",
    "countryName": "Sri Lanka",
    "countryCode": "LK",
    "flagEmoji": "🇱🇰",
    "latitude": 7.0,
    "longitude": 81.0,
    "aliases": [
      "Sri Lanka",
      "Democratic Socialist Republic of Sri Lanka"
    ],
    "featured": false,
    "sortOrder": 1198
  },
  {
    "key": "sudan",
    "displayName": "Sudan",
    "countryName": "Sudan",
    "countryCode": "SD",
    "flagEmoji": "🇸🇩",
    "latitude": 15.0,
    "longitude": 30.0,
    "aliases": [
      "Sudan",
      "Republic of the Sudan"
    ],
    "featured": false,
    "sortOrder": 1199
  },
  {
    "key": "suriname",
    "displayName": "Suriname",
    "countryName": "Suriname",
    "countryCode": "SR",
    "flagEmoji": "🇸🇷",
    "latitude": 4.0,
    "longitude": -56.0,
    "aliases": [
      "Suriname",
      "Republic of Suriname"
    ],
    "featured": false,
    "sortOrder": 1200
  },
  {
    "key": "svalbard-and-jan-mayen",
    "displayName": "Svalbard and Jan Mayen",
    "countryName": "Svalbard and Jan Mayen",
    "countryCode": "SJ",
    "flagEmoji": "🇸🇯",
    "latitude": 78.0,
    "longitude": 20.0,
    "aliases": [
      "Svalbard and Jan Mayen"
    ],
    "featured": false,
    "sortOrder": 1201
  },
  {
    "key": "sweden",
    "displayName": "Sweden",
    "countryName": "Sweden",
    "countryCode": "SE",
    "flagEmoji": "🇸🇪",
    "latitude": 62.0,
    "longitude": 15.0,
    "aliases": [
      "Sweden",
      "Kingdom of Sweden"
    ],
    "featured": false,
    "sortOrder": 1202
  },
  {
    "key": "switzerland",
    "displayName": "Switzerland",
    "countryName": "Switzerland",
    "countryCode": "CH",
    "flagEmoji": "🇨🇭",
    "latitude": 47.0,
    "longitude": 8.0,
    "aliases": [
      "Switzerland",
      "Swiss Confederation"
    ],
    "featured": false,
    "sortOrder": 1203
  },
  {
    "key": "syrian-arab-republic",
    "displayName": "Syrian Arab Republic",
    "countryName": "Syrian Arab Republic",
    "countryCode": "SY",
    "flagEmoji": "🇸🇾",
    "latitude": 35.0,
    "longitude": 38.0,
    "aliases": [
      "Syrian Arab Republic",
      "Syria"
    ],
    "featured": false,
    "sortOrder": 1204
  },
  {
    "key": "taiwan-province-of-china",
    "displayName": "Taiwan, Province of China",
    "countryName": "Taiwan, Province of China",
    "countryCode": "TW",
    "flagEmoji": "🇹🇼",
    "latitude": 23.5,
    "longitude": 121.0,
    "aliases": [
      "Taiwan, Province of China",
      "Taiwan"
    ],
    "featured": false,
    "sortOrder": 1205
  },
  {
    "key": "tajikistan",
    "displayName": "Tajikistan",
    "countryName": "Tajikistan",
    "countryCode": "TJ",
    "flagEmoji": "🇹🇯",
    "latitude": 39.0,
    "longitude": 71.0,
    "aliases": [
      "Tajikistan",
      "Republic of Tajikistan"
    ],
    "featured": false,
    "sortOrder": 1206
  },
  {
    "key": "tanzania-united-republic-of",
    "displayName": "Tanzania, United Republic of",
    "countryName": "Tanzania, United Republic of",
    "countryCode": "TZ",
    "flagEmoji": "🇹🇿",
    "latitude": -6.0,
    "longitude": 35.0,
    "aliases": [
      "Tanzania, United Republic of",
      "United Republic of Tanzania",
      "Tanzania"
    ],
    "featured": false,
    "sortOrder": 1207
  },
  {
    "key": "thailand",
    "displayName": "Thailand",
    "countryName": "Thailand",
    "countryCode": "TH",
    "flagEmoji": "🇹🇭",
    "latitude": 15.0,
    "longitude": 100.0,
    "aliases": [
      "Thailand",
      "Kingdom of Thailand"
    ],
    "featured": false,
    "sortOrder": 1208
  },
  {
    "key": "timor-leste",
    "displayName": "Timor-Leste",
    "countryName": "Timor-Leste",
    "countryCode": "TL",
    "flagEmoji": "🇹🇱",
    "latitude": -8.83333333,
    "longitude": 125.91666666,
    "aliases": [
      "Timor-Leste",
      "Democratic Republic of Timor-Leste"
    ],
    "featured": false,
    "sortOrder": 1209
  },
  {
    "key": "togo",
    "displayName": "Togo",
    "countryName": "Togo",
    "countryCode": "TG",
    "flagEmoji": "🇹🇬",
    "latitude": 8.0,
    "longitude": 1.16666666,
    "aliases": [
      "Togo",
      "Togolese Republic"
    ],
    "featured": false,
    "sortOrder": 1210
  },
  {
    "key": "tokelau",
    "displayName": "Tokelau",
    "countryName": "Tokelau",
    "countryCode": "TK",
    "flagEmoji": "🇹🇰",
    "latitude": -9.0,
    "longitude": -172.0,
    "aliases": [
      "Tokelau"
    ],
    "featured": false,
    "sortOrder": 1211
  },
  {
    "key": "tonga",
    "displayName": "Tonga",
    "countryName": "Tonga",
    "countryCode": "TO",
    "flagEmoji": "🇹🇴",
    "latitude": -20.0,
    "longitude": -175.0,
    "aliases": [
      "Tonga",
      "Kingdom of Tonga"
    ],
    "featured": false,
    "sortOrder": 1212
  },
  {
    "key": "trinidad-and-tobago",
    "displayName": "Trinidad and Tobago",
    "countryName": "Trinidad and Tobago",
    "countryCode": "TT",
    "flagEmoji": "🇹🇹",
    "latitude": 11.0,
    "longitude": -61.0,
    "aliases": [
      "Trinidad and Tobago",
      "Republic of Trinidad and Tobago"
    ],
    "featured": false,
    "sortOrder": 1213
  },
  {
    "key": "tunisia",
    "displayName": "Tunisia",
    "countryName": "Tunisia",
    "countryCode": "TN",
    "flagEmoji": "🇹🇳",
    "latitude": 34.0,
    "longitude": 9.0,
    "aliases": [
      "Tunisia",
      "Republic of Tunisia"
    ],
    "featured": false,
    "sortOrder": 1214
  },
  {
    "key": "turkmenistan",
    "displayName": "Turkmenistan",
    "countryName": "Turkmenistan",
    "countryCode": "TM",
    "flagEmoji": "🇹🇲",
    "latitude": 40.0,
    "longitude": 60.0,
    "aliases": [
      "Turkmenistan"
    ],
    "featured": false,
    "sortOrder": 1215
  },
  {
    "key": "turks-and-caicos-islands",
    "displayName": "Turks and Caicos Islands",
    "countryName": "Turks and Caicos Islands",
    "countryCode": "TC",
    "flagEmoji": "🇹🇨",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Turks and Caicos Islands"
    ],
    "featured": false,
    "sortOrder": 1216
  },
  {
    "key": "tuvalu",
    "displayName": "Tuvalu",
    "countryName": "Tuvalu",
    "countryCode": "TV",
    "flagEmoji": "🇹🇻",
    "latitude": -8.0,
    "longitude": 178.0,
    "aliases": [
      "Tuvalu"
    ],
    "featured": false,
    "sortOrder": 1217
  },
  {
    "key": "t-rkiye",
    "displayName": "Türkiye",
    "countryName": "Türkiye",
    "countryCode": "TR",
    "flagEmoji": "🇹🇷",
    "latitude": 39.0,
    "longitude": 35.0,
    "aliases": [
      "Türkiye",
      "Republic of Türkiye"
    ],
    "featured": false,
    "sortOrder": 1218
  },
  {
    "key": "uganda",
    "displayName": "Uganda",
    "countryName": "Uganda",
    "countryCode": "UG",
    "flagEmoji": "🇺🇬",
    "latitude": 1.0,
    "longitude": 32.0,
    "aliases": [
      "Uganda",
      "Republic of Uganda"
    ],
    "featured": false,
    "sortOrder": 1219
  },
  {
    "key": "ukraine",
    "displayName": "Ukraine",
    "countryName": "Ukraine",
    "countryCode": "UA",
    "flagEmoji": "🇺🇦",
    "latitude": 49.0,
    "longitude": 32.0,
    "aliases": [
      "Ukraine"
    ],
    "featured": false,
    "sortOrder": 1220
  },
  {
    "key": "united-arab-emirates",
    "displayName": "United Arab Emirates",
    "countryName": "United Arab Emirates",
    "countryCode": "AE",
    "flagEmoji": "🇦🇪",
    "latitude": 24.0,
    "longitude": 54.0,
    "aliases": [
      "United Arab Emirates"
    ],
    "featured": false,
    "sortOrder": 1221
  },
  {
    "key": "united-kingdom",
    "displayName": "United Kingdom",
    "countryName": "United Kingdom",
    "countryCode": "GB",
    "flagEmoji": "🇬🇧",
    "latitude": 54.0,
    "longitude": -2.0,
    "aliases": [
      "United Kingdom",
      "United Kingdom of Great Britain and Northern Ireland"
    ],
    "featured": false,
    "sortOrder": 1222
  },
  {
    "key": "united-states-minor-outlying-islands",
    "displayName": "United States Minor Outlying Islands",
    "countryName": "United States Minor Outlying Islands",
    "countryCode": "UM",
    "flagEmoji": "🇺🇲",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "United States Minor Outlying Islands"
    ],
    "featured": false,
    "sortOrder": 1223
  },
  {
    "key": "uruguay",
    "displayName": "Uruguay",
    "countryName": "Uruguay",
    "countryCode": "UY",
    "flagEmoji": "🇺🇾",
    "latitude": -33.0,
    "longitude": -56.0,
    "aliases": [
      "Uruguay",
      "Eastern Republic of Uruguay"
    ],
    "featured": false,
    "sortOrder": 1224
  },
  {
    "key": "uzbekistan",
    "displayName": "Uzbekistan",
    "countryName": "Uzbekistan",
    "countryCode": "UZ",
    "flagEmoji": "🇺🇿",
    "latitude": 41.0,
    "longitude": 64.0,
    "aliases": [
      "Uzbekistan",
      "Republic of Uzbekistan"
    ],
    "featured": false,
    "sortOrder": 1225
  },
  {
    "key": "vanuatu",
    "displayName": "Vanuatu",
    "countryName": "Vanuatu",
    "countryCode": "VU",
    "flagEmoji": "🇻🇺",
    "latitude": -16.0,
    "longitude": 167.0,
    "aliases": [
      "Vanuatu",
      "Republic of Vanuatu"
    ],
    "featured": false,
    "sortOrder": 1226
  },
  {
    "key": "venezuela-bolivarian-republic-of",
    "displayName": "Venezuela, Bolivarian Republic of",
    "countryName": "Venezuela, Bolivarian Republic of",
    "countryCode": "VE",
    "flagEmoji": "🇻🇪",
    "latitude": 8.0,
    "longitude": -66.0,
    "aliases": [
      "Venezuela, Bolivarian Republic of",
      "Bolivarian Republic of Venezuela",
      "Venezuela"
    ],
    "featured": false,
    "sortOrder": 1227
  },
  {
    "key": "viet-nam",
    "displayName": "Viet Nam",
    "countryName": "Viet Nam",
    "countryCode": "VN",
    "flagEmoji": "🇻🇳",
    "latitude": 16.16666666,
    "longitude": 107.83333333,
    "aliases": [
      "Viet Nam",
      "Socialist Republic of Viet Nam",
      "Vietnam"
    ],
    "featured": false,
    "sortOrder": 1228
  },
  {
    "key": "virgin-islands-british",
    "displayName": "Virgin Islands, British",
    "countryName": "Virgin Islands, British",
    "countryCode": "VG",
    "flagEmoji": "🇻🇬",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Virgin Islands, British",
      "British Virgin Islands"
    ],
    "featured": false,
    "sortOrder": 1229
  },
  {
    "key": "virgin-islands-u-s",
    "displayName": "Virgin Islands, U.S.",
    "countryName": "Virgin Islands, U.S.",
    "countryCode": "VI",
    "flagEmoji": "🇻🇮",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Virgin Islands, U.S.",
      "Virgin Islands of the United States"
    ],
    "featured": false,
    "sortOrder": 1230
  },
  {
    "key": "wallis-and-futuna",
    "displayName": "Wallis and Futuna",
    "countryName": "Wallis and Futuna",
    "countryCode": "WF",
    "flagEmoji": "🇼🇫",
    "latitude": -13.3,
    "longitude": -176.2,
    "aliases": [
      "Wallis and Futuna"
    ],
    "featured": false,
    "sortOrder": 1231
  },
  {
    "key": "western-sahara",
    "displayName": "Western Sahara",
    "countryName": "Western Sahara",
    "countryCode": "EH",
    "flagEmoji": "🇪🇭",
    "latitude": 24.5,
    "longitude": -13.0,
    "aliases": [
      "Western Sahara"
    ],
    "featured": false,
    "sortOrder": 1232
  },
  {
    "key": "yemen",
    "displayName": "Yemen",
    "countryName": "Yemen",
    "countryCode": "YE",
    "flagEmoji": "🇾🇪",
    "latitude": 15.0,
    "longitude": 48.0,
    "aliases": [
      "Yemen",
      "Republic of Yemen"
    ],
    "featured": false,
    "sortOrder": 1233
  },
  {
    "key": "zambia",
    "displayName": "Zambia",
    "countryName": "Zambia",
    "countryCode": "ZM",
    "flagEmoji": "🇿🇲",
    "latitude": -15.0,
    "longitude": 30.0,
    "aliases": [
      "Zambia",
      "Republic of Zambia"
    ],
    "featured": false,
    "sortOrder": 1234
  },
  {
    "key": "zimbabwe",
    "displayName": "Zimbabwe",
    "countryName": "Zimbabwe",
    "countryCode": "ZW",
    "flagEmoji": "🇿🇼",
    "latitude": -20.0,
    "longitude": 30.0,
    "aliases": [
      "Zimbabwe",
      "Republic of Zimbabwe"
    ],
    "featured": false,
    "sortOrder": 1235
  },
  {
    "key": "land-islands",
    "displayName": "Åland Islands",
    "countryName": "Åland Islands",
    "countryCode": "AX",
    "flagEmoji": "🇦🇽",
    "latitude": null,
    "longitude": null,
    "aliases": [
      "Åland Islands"
    ],
    "featured": false,
    "sortOrder": 1236
  }
];

export const FEATURED_ANCESTRY_KEYS = new Set(
  ANCESTRY_CATALOG.filter((item) => item.featured).map((item) => item.key)
);
