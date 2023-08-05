export type DerugProgram = {
  version: "0.1.0";
  name: "derug_program";
  instructions: [
    {
      name: "initializeDerug";
      accounts: [
        {
          name: "collectionKey";
          isMut: false;
          isSigner: false;
        },
        {
          name: "derugData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collectionMetadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "totalSupply";
          type: "u32";
        },
        {
          name: "slug";
          type: "string";
        }
      ];
    },
    {
      name: "createOrUpdateDerugRequest";
      accounts: [
        {
          name: "derugRequest";
          isMut: true;
          isSigner: false;
        },
        {
          name: "derugData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "feeWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "newName";
          type: "string";
        },
        {
          name: "newSymbol";
          type: "string";
        },
        {
          name: "mintConfig";
          type: {
            defined: "MintConfig";
          };
        },
        {
          name: "creators";
          type: {
            vec: {
              defined: "DeruggerCreator";
            };
          };
        }
      ];
    },
    {
      name: "vote";
      accounts: [
        {
          name: "derugRequest";
          isMut: true;
          isSigner: false;
        },
        {
          name: "derugData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "feeWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "cancelDerugRequest";
      accounts: [
        {
          name: "derugRequest";
          isMut: true;
          isSigner: false;
        },
        {
          name: "derugData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "claimVictory";
      accounts: [
        {
          name: "derugRequest";
          isMut: true;
          isSigner: false;
        },
        {
          name: "derugData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "feeWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "initializeReminting";
      accounts: [
        {
          name: "derugRequest";
          isMut: true;
          isSigner: false;
        },
        {
          name: "derugData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "newCollection";
          isMut: true;
          isSigner: true;
        },
        {
          name: "tokenAccount";
          isMut: true;
          isSigner: true;
        },
        {
          name: "masterEdition";
          isMut: true;
          isSigner: false;
        },
        {
          name: "metadataAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "feeWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "remintNft";
      accounts: [
        {
          name: "derugRequest";
          isMut: false;
          isSigner: false;
        },
        {
          name: "derugData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "newCollection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "derugger";
          isMut: false;
          isSigner: false;
        },
        {
          name: "remintProof";
          isMut: true;
          isSigner: false;
        },
        {
          name: "oldCollection";
          isMut: false;
          isSigner: false;
        },
        {
          name: "oldMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "newMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "oldToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "newToken";
          isMut: false;
          isSigner: false;
        },
        {
          name: "oldMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "newMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "firstCreator";
          isMut: false;
          isSigner: false;
        },
        {
          name: "oldEdition";
          isMut: true;
          isSigner: false;
        },
        {
          name: "newEdition";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pdaAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collectionMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collectionMetadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collectionMasterEdition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "feeWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "metaplexFoundationRuleset";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metaplexAuthorizationRules";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "sysvarInstructions";
          isMut: false;
          isSigner: false;
        },
        {
          name: "splAtaProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "closeProgramAccount";
      accounts: [
        {
          name: "derugData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "derugRequest";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "remintConfig";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "closeSingleRequest";
      accounts: [
        {
          name: "derugRequest";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: "closeRemintConfig";
      accounts: [
        {
          name: "remintConfg";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: "freezeNft";
      accounts: [
        {
          name: "nftMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftMasterEdition";
          isMut: true;
          isSigner: false;
        },
        {
          name: "delegate";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metaplexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "initPrivateMint";
      accounts: [
        {
          name: "derugData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "derugRequest";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: "totalSupply";
          type: "u32";
        }
      ];
    },
    {
      name: "bypassVoting";
      accounts: [
        {
          name: "derugRequest";
          isMut: true;
          isSigner: false;
        },
        {
          name: "derugData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: "initPublicMint";
      accounts: [
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "derugData";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "derugData";
      type: {
        kind: "struct";
        fields: [
          {
            name: "slug";
            type: "string";
          },
          {
            name: "collection";
            type: "publicKey";
          },
          {
            name: "rugUpdateAuthority";
            type: "publicKey";
          },
          {
            name: "collectionMetadata";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "totalSupply";
            type: "u32";
          },
          {
            name: "newCollection";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "thresholdDenominator";
            type: "u8";
          },
          {
            name: "dateAdded";
            type: "i64";
          },
          {
            name: "derugStatus";
            type: {
              defined: "DerugStatus";
            };
          },
          {
            name: "periodEnd";
            type: "i64";
          },
          {
            name: "totalReminted";
            type: "u32";
          },
          {
            name: "winningRequest";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "totalSuggestionCount";
            type: "u8";
          },
          {
            name: "collectionName";
            type: "string";
          },
          {
            name: "collectionSymbol";
            type: "string";
          },
          {
            name: "collectionUri";
            type: "string";
          },
          {
            name: "activeRequests";
            type: {
              vec: {
                defined: "ActiveRequest";
              };
            };
          }
        ];
      };
    },
    {
      name: "derugRequest";
      type: {
        kind: "struct";
        fields: [
          {
            name: "derugData";
            type: "publicKey";
          },
          {
            name: "newName";
            type: "string";
          },
          {
            name: "newSymbol";
            type: "string";
          },
          {
            name: "derugger";
            type: "publicKey";
          },
          {
            name: "createdAt";
            type: "i64";
          },
          {
            name: "voteCount";
            type: "u32";
          },
          {
            name: "requestStatus";
            type: {
              defined: "RequestStatus";
            };
          },
          {
            name: "creators";
            type: {
              vec: {
                defined: "DeruggerCreator";
              };
            };
          },
          {
            name: "mintConfig";
            type: {
              defined: "MintConfig";
            };
          }
        ];
      };
    },
    {
      name: "remintProof";
      type: {
        kind: "struct";
        fields: [
          {
            name: "derugData";
            type: "publicKey";
          },
          {
            name: "reminter";
            type: "publicKey";
          },
          {
            name: "oldMint";
            type: "publicKey";
          },
          {
            name: "newMint";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "remintConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "derugRequest";
            type: "publicKey";
          },
          {
            name: "newName";
            type: "string";
          },
          {
            name: "newSymbol";
            type: "string";
          },
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "collection";
            type: "publicKey";
          },
          {
            name: "publicMintPrice";
            type: {
              option: "u64";
            };
          },
          {
            name: "mintCurrency";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "mintFeeTreasury";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "privateMintEnd";
            type: {
              option: "i64";
            };
          },
          {
            name: "creators";
            type: {
              vec: {
                defined: "DeruggerCreator";
              };
            };
          },
          {
            name: "walletLimit";
            type: {
              option: "u8";
            };
          },
          {
            name: "candyMachineKey";
            type: "publicKey";
          },
          {
            name: "candyMachineCreator";
            type: "publicKey";
          },
          {
            name: "sellerFeeBps";
            type: "u32";
          }
        ];
      };
    },
    {
      name: "voteRecord";
      type: {
        kind: "struct";
        fields: [
          {
            name: "voted";
            type: "bool";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "ActiveRequest";
      type: {
        kind: "struct";
        fields: [
          {
            name: "request";
            type: "publicKey";
          },
          {
            name: "voteCount";
            type: "i32";
          },
          {
            name: "winning";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "MintConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "candyMachineKey";
            type: "publicKey";
          },
          {
            name: "publicMintPrice";
            type: "u64";
          },
          {
            name: "mintCurrency";
            type: "publicKey";
          },
          {
            name: "remintDuration";
            type: "i64";
          },
          {
            name: "sellerFeeBps";
            type: "u16";
          },
          {
            name: "whitelistConfig";
            type: {
              option: {
                defined: "WhitelistConfig";
              };
            };
          },
          {
            name: "destinationAta";
            type: {
              option: "publicKey";
            };
          }
        ];
      };
    },
    {
      name: "WhitelistConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "price";
            type: "u64";
          },
          {
            name: "currency";
            type: "publicKey";
          },
          {
            name: "duration";
            type: "u32";
          }
        ];
      };
    },
    {
      name: "DeruggerCreator";
      type: {
        kind: "struct";
        fields: [
          {
            name: "address";
            type: "publicKey";
          },
          {
            name: "share";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "UtilityData";
      type: {
        kind: "struct";
        fields: [
          {
            name: "title";
            type: "string";
          },
          {
            name: "description";
            type: "string";
          },
          {
            name: "isActive";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "UpdateUtilityDataDto";
      type: {
        kind: "struct";
        fields: [
          {
            name: "title";
            type: "string";
          },
          {
            name: "description";
            type: "string";
          },
          {
            name: "action";
            type: {
              defined: "Action";
            };
          }
        ];
      };
    },
    {
      name: "DerugStatus";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Initialized";
          },
          {
            name: "Voting";
          },
          {
            name: "Succeeded";
          },
          {
            name: "UploadingMetadata";
          },
          {
            name: "Reminting";
          },
          {
            name: "PublicMint";
          },
          {
            name: "Completed";
          }
        ];
      };
    },
    {
      name: "RequestStatus";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Initialized";
          },
          {
            name: "Voting";
          },
          {
            name: "Succeeded";
          },
          {
            name: "UploadingMetadata";
          },
          {
            name: "Reminting";
          },
          {
            name: "PublicMint";
          },
          {
            name: "Completed";
          }
        ];
      };
    },
    {
      name: "Action";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Add";
          },
          {
            name: "Remove";
          }
        ];
      };
    }
  ];
  events: [
    {
      name: "NftRemintedEvent";
      fields: [
        {
          name: "reminter";
          type: "publicKey";
          index: false;
        },
        {
          name: "newNftMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "newNftMetadata";
          type: "publicKey";
          index: false;
        },
        {
          name: "oldNftMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "oldNftMetadata";
          type: "publicKey";
          index: false;
        }
      ];
    },
    {
      name: "PrivateMintStarted";
      fields: [
        {
          name: "derugData";
          type: "publicKey";
          index: false;
        }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "RuggerSigner";
      msg: "This wallet rugged the collection";
    },
    {
      code: 6001;
      name: "InvalidVoteRecord";
      msg: "Vote record seeds aren't correct";
    },
    {
      code: 6002;
      name: "InvalidTokenAccountMint";
      msg: "Token account is not correct for the mint";
    },
    {
      code: 6003;
      name: "InvalidMetadata";
      msg: "Metadata is not correct for the mint";
    },
    {
      code: 6004;
      name: "EmptyTokenAccount";
      msg: "Token account doesn't possess the nft";
    },
    {
      code: 6005;
      name: "WrongOwner";
      msg: "Payer doesn't own the token account";
    },
    {
      code: 6006;
      name: "AlereadyVoted";
      msg: "User alredy voted with given nft";
    },
    {
      code: 6007;
      name: "WrongDerugger";
      msg: "Signer isn't the required derugger";
    },
    {
      code: 6008;
      name: "InvalidWinningRequest";
      msg: "Request isn't the winning one";
    },
    {
      code: 6009;
      name: "TimeIsOut";
      msg: "You cannot make requests anymore";
    },
    {
      code: 6010;
      name: "NoWinner";
      msg: "There is no winner yet";
    },
    {
      code: 6011;
      name: "CandyMachineUsed";
      msg: "This is not a new candy machine";
    },
    {
      code: 6012;
      name: "InvalidStatus";
      msg: "Derug isn't in the required state";
    },
    {
      code: 6013;
      name: "WrongCollection";
      msg: "Wrong collection sent ";
    },
    {
      code: 6014;
      name: "InvalidSellerFeeBps";
      msg: "Invalid seller fee basis points amount";
    },
    {
      code: 6015;
      name: "InvalidMintCurrency";
      msg: "Invalid mint currency";
    },
    {
      code: 6016;
      name: "InvalidTokenOwner";
      msg: "Invalid token owner";
    },
    {
      code: 6017;
      name: "TooManyCreators";
      msg: "Too many creators";
    },
    {
      code: 6018;
      name: "PrivateMintEnded";
      msg: "Private mint ended";
    }
  ];
};

export const IDL: DerugProgram = {
  version: "0.1.0",
  name: "derug_program",
  instructions: [
    {
      name: "initializeDerug",
      accounts: [
        {
          name: "collectionKey",
          isMut: false,
          isSigner: false,
        },
        {
          name: "derugData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collectionMetadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "totalSupply",
          type: "u32",
        },
        {
          name: "slug",
          type: "string",
        },
      ],
    },
    {
      name: "createOrUpdateDerugRequest",
      accounts: [
        {
          name: "derugRequest",
          isMut: true,
          isSigner: false,
        },
        {
          name: "derugData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "feeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "newName",
          type: "string",
        },
        {
          name: "newSymbol",
          type: "string",
        },
        {
          name: "mintConfig",
          type: {
            defined: "MintConfig",
          },
        },
        {
          name: "creators",
          type: {
            vec: {
              defined: "DeruggerCreator",
            },
          },
        },
      ],
    },
    {
      name: "vote",
      accounts: [
        {
          name: "derugRequest",
          isMut: true,
          isSigner: false,
        },
        {
          name: "derugData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "feeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "cancelDerugRequest",
      accounts: [
        {
          name: "derugRequest",
          isMut: true,
          isSigner: false,
        },
        {
          name: "derugData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "claimVictory",
      accounts: [
        {
          name: "derugRequest",
          isMut: true,
          isSigner: false,
        },
        {
          name: "derugData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "feeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "initializeReminting",
      accounts: [
        {
          name: "derugRequest",
          isMut: true,
          isSigner: false,
        },
        {
          name: "derugData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "newCollection",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: true,
        },
        {
          name: "masterEdition",
          isMut: true,
          isSigner: false,
        },
        {
          name: "metadataAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "feeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "remintNft",
      accounts: [
        {
          name: "derugRequest",
          isMut: false,
          isSigner: false,
        },
        {
          name: "derugData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "newCollection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "derugger",
          isMut: false,
          isSigner: false,
        },
        {
          name: "remintProof",
          isMut: true,
          isSigner: false,
        },
        {
          name: "oldCollection",
          isMut: false,
          isSigner: false,
        },
        {
          name: "oldMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "newMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "oldToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "newToken",
          isMut: false,
          isSigner: false,
        },
        {
          name: "oldMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "newMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "firstCreator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "oldEdition",
          isMut: true,
          isSigner: false,
        },
        {
          name: "newEdition",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pdaAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collectionMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collectionMetadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collectionMasterEdition",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "feeWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "metaplexFoundationRuleset",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metaplexAuthorizationRules",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "sysvarInstructions",
          isMut: false,
          isSigner: false,
        },
        {
          name: "splAtaProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "closeProgramAccount",
      accounts: [
        {
          name: "derugData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "derugRequest",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "remintConfig",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "closeSingleRequest",
      accounts: [
        {
          name: "derugRequest",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "closeRemintConfig",
      accounts: [
        {
          name: "remintConfg",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "freezeNft",
      accounts: [
        {
          name: "nftMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftMasterEdition",
          isMut: true,
          isSigner: false,
        },
        {
          name: "delegate",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metaplexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "initPrivateMint",
      accounts: [
        {
          name: "derugData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "derugRequest",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "totalSupply",
          type: "u32",
        },
      ],
    },
    {
      name: "bypassVoting",
      accounts: [
        {
          name: "derugRequest",
          isMut: true,
          isSigner: false,
        },
        {
          name: "derugData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "initPublicMint",
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "derugData",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "derugData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "slug",
            type: "string",
          },
          {
            name: "collection",
            type: "publicKey",
          },
          {
            name: "rugUpdateAuthority",
            type: "publicKey",
          },
          {
            name: "collectionMetadata",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "totalSupply",
            type: "u32",
          },
          {
            name: "newCollection",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "thresholdDenominator",
            type: "u8",
          },
          {
            name: "dateAdded",
            type: "i64",
          },
          {
            name: "derugStatus",
            type: {
              defined: "DerugStatus",
            },
          },
          {
            name: "periodEnd",
            type: "i64",
          },
          {
            name: "totalReminted",
            type: "u32",
          },
          {
            name: "winningRequest",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "totalSuggestionCount",
            type: "u8",
          },
          {
            name: "collectionName",
            type: "string",
          },
          {
            name: "collectionSymbol",
            type: "string",
          },
          {
            name: "collectionUri",
            type: "string",
          },
          {
            name: "activeRequests",
            type: {
              vec: {
                defined: "ActiveRequest",
              },
            },
          },
        ],
      },
    },
    {
      name: "derugRequest",
      type: {
        kind: "struct",
        fields: [
          {
            name: "derugData",
            type: "publicKey",
          },
          {
            name: "newName",
            type: "string",
          },
          {
            name: "newSymbol",
            type: "string",
          },
          {
            name: "derugger",
            type: "publicKey",
          },
          {
            name: "createdAt",
            type: "i64",
          },
          {
            name: "voteCount",
            type: "u32",
          },
          {
            name: "requestStatus",
            type: {
              defined: "RequestStatus",
            },
          },
          {
            name: "creators",
            type: {
              vec: {
                defined: "DeruggerCreator",
              },
            },
          },
          {
            name: "mintConfig",
            type: {
              defined: "MintConfig",
            },
          },
        ],
      },
    },
    {
      name: "remintProof",
      type: {
        kind: "struct",
        fields: [
          {
            name: "derugData",
            type: "publicKey",
          },
          {
            name: "reminter",
            type: "publicKey",
          },
          {
            name: "oldMint",
            type: "publicKey",
          },
          {
            name: "newMint",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "remintConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "derugRequest",
            type: "publicKey",
          },
          {
            name: "newName",
            type: "string",
          },
          {
            name: "newSymbol",
            type: "string",
          },
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "collection",
            type: "publicKey",
          },
          {
            name: "publicMintPrice",
            type: {
              option: "u64",
            },
          },
          {
            name: "mintCurrency",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "mintFeeTreasury",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "privateMintEnd",
            type: {
              option: "i64",
            },
          },
          {
            name: "creators",
            type: {
              vec: {
                defined: "DeruggerCreator",
              },
            },
          },
          {
            name: "walletLimit",
            type: {
              option: "u8",
            },
          },
          {
            name: "candyMachineKey",
            type: "publicKey",
          },
          {
            name: "candyMachineCreator",
            type: "publicKey",
          },
          {
            name: "sellerFeeBps",
            type: "u32",
          },
        ],
      },
    },
    {
      name: "voteRecord",
      type: {
        kind: "struct",
        fields: [
          {
            name: "voted",
            type: "bool",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "ActiveRequest",
      type: {
        kind: "struct",
        fields: [
          {
            name: "request",
            type: "publicKey",
          },
          {
            name: "voteCount",
            type: "i32",
          },
          {
            name: "winning",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "MintConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "candyMachineKey",
            type: "publicKey",
          },
          {
            name: "publicMintPrice",
            type: "u64",
          },
          {
            name: "mintCurrency",
            type: "publicKey",
          },
          {
            name: "remintDuration",
            type: "i64",
          },
          {
            name: "sellerFeeBps",
            type: "u16",
          },
          {
            name: "whitelistConfig",
            type: {
              option: {
                defined: "WhitelistConfig",
              },
            },
          },
          {
            name: "destinationAta",
            type: {
              option: "publicKey",
            },
          },
        ],
      },
    },
    {
      name: "WhitelistConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "price",
            type: "u64",
          },
          {
            name: "currency",
            type: "publicKey",
          },
          {
            name: "duration",
            type: "u32",
          },
        ],
      },
    },
    {
      name: "DeruggerCreator",
      type: {
        kind: "struct",
        fields: [
          {
            name: "address",
            type: "publicKey",
          },
          {
            name: "share",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "UtilityData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "title",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "isActive",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "UpdateUtilityDataDto",
      type: {
        kind: "struct",
        fields: [
          {
            name: "title",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "action",
            type: {
              defined: "Action",
            },
          },
        ],
      },
    },
    {
      name: "DerugStatus",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Initialized",
          },
          {
            name: "Voting",
          },
          {
            name: "Succeeded",
          },
          {
            name: "UploadingMetadata",
          },
          {
            name: "Reminting",
          },
          {
            name: "PublicMint",
          },
          {
            name: "Completed",
          },
        ],
      },
    },
    {
      name: "RequestStatus",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Initialized",
          },
          {
            name: "Voting",
          },
          {
            name: "Succeeded",
          },
          {
            name: "UploadingMetadata",
          },
          {
            name: "Reminting",
          },
          {
            name: "PublicMint",
          },
          {
            name: "Completed",
          },
        ],
      },
    },
    {
      name: "Action",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Add",
          },
          {
            name: "Remove",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "NftRemintedEvent",
      fields: [
        {
          name: "reminter",
          type: "publicKey",
          index: false,
        },
        {
          name: "newNftMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "newNftMetadata",
          type: "publicKey",
          index: false,
        },
        {
          name: "oldNftMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "oldNftMetadata",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "PrivateMintStarted",
      fields: [
        {
          name: "derugData",
          type: "publicKey",
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "RuggerSigner",
      msg: "This wallet rugged the collection",
    },
    {
      code: 6001,
      name: "InvalidVoteRecord",
      msg: "Vote record seeds aren't correct",
    },
    {
      code: 6002,
      name: "InvalidTokenAccountMint",
      msg: "Token account is not correct for the mint",
    },
    {
      code: 6003,
      name: "InvalidMetadata",
      msg: "Metadata is not correct for the mint",
    },
    {
      code: 6004,
      name: "EmptyTokenAccount",
      msg: "Token account doesn't possess the nft",
    },
    {
      code: 6005,
      name: "WrongOwner",
      msg: "Payer doesn't own the token account",
    },
    {
      code: 6006,
      name: "AlereadyVoted",
      msg: "User alredy voted with given nft",
    },
    {
      code: 6007,
      name: "WrongDerugger",
      msg: "Signer isn't the required derugger",
    },
    {
      code: 6008,
      name: "InvalidWinningRequest",
      msg: "Request isn't the winning one",
    },
    {
      code: 6009,
      name: "TimeIsOut",
      msg: "You cannot make requests anymore",
    },
    {
      code: 6010,
      name: "NoWinner",
      msg: "There is no winner yet",
    },
    {
      code: 6011,
      name: "CandyMachineUsed",
      msg: "This is not a new candy machine",
    },
    {
      code: 6012,
      name: "InvalidStatus",
      msg: "Derug isn't in the required state",
    },
    {
      code: 6013,
      name: "WrongCollection",
      msg: "Wrong collection sent ",
    },
    {
      code: 6014,
      name: "InvalidSellerFeeBps",
      msg: "Invalid seller fee basis points amount",
    },
    {
      code: 6015,
      name: "InvalidMintCurrency",
      msg: "Invalid mint currency",
    },
    {
      code: 6016,
      name: "InvalidTokenOwner",
      msg: "Invalid token owner",
    },
    {
      code: 6017,
      name: "TooManyCreators",
      msg: "Too many creators",
    },
    {
      code: 6018,
      name: "PrivateMintEnded",
      msg: "Private mint ended",
    },
  ],
};
