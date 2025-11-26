/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/roundpot.json`.
 */
export type Roundpot = {
  "address": "9PbdrKGxA7PdRbnSwjhDJbMirSCgSGCABtwEeBb3hyrj",
  "metadata": {
    "name": "roundpot",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "activatePool",
      "docs": [
        "Activate a full pool (start first cycle)"
      ],
      "discriminator": [
        129,
        125,
        90,
        174,
        121,
        169,
        225,
        239
      ],
      "accounts": [
        {
          "name": "anySigner",
          "writable": true,
          "signer": true
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.admin",
                "account": "roscaPool"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "contribute",
      "docs": [
        "Contribute to the current cycle"
      ],
      "discriminator": [
        82,
        33,
        68,
        131,
        32,
        0,
        205,
        95
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.admin",
                "account": "roscaPool"
              }
            ]
          },
          "relations": [
            "memberAccount"
          ]
        },
        {
          "name": "poolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "memberAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  98,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "payerAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "initializePool",
      "docs": [
        "Create a new RoundPot pool"
      ],
      "discriminator": [
        95,
        180,
        10,
        172,
        84,
        174,
        232,
        40
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "contributionAmount",
          "type": "u64"
        },
        {
          "name": "maxMembers",
          "type": "u8"
        },
        {
          "name": "cycleDuration",
          "type": "i64"
        }
      ]
    },
    {
      "name": "joinPool",
      "docs": [
        "Join an existing pool (deposit collateral)"
      ],
      "discriminator": [
        14,
        65,
        62,
        16,
        116,
        17,
        195,
        107
      ],
      "accounts": [
        {
          "name": "memberSigner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.admin",
                "account": "roscaPool"
              }
            ]
          }
        },
        {
          "name": "memberAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  98,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "memberSigner"
              }
            ]
          }
        },
        {
          "name": "memberAta",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "settleCurrentCycle",
      "docs": [
        "Settle and distribute the current cycle pot"
      ],
      "discriminator": [
        101,
        112,
        111,
        155,
        165,
        227,
        77,
        2
      ],
      "accounts": [
        {
          "name": "caller",
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.admin",
                "account": "roscaPool"
              }
            ]
          }
        },
        {
          "name": "poolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "treasuryAta",
          "writable": true
        },
        {
          "name": "recipientMember",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  98,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "recipientWallet"
              }
            ]
          }
        },
        {
          "name": "recipientWallet",
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "recipientAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "withdrawCollateral",
      "docs": [
        "Withdraw remaining collateral after completion"
      ],
      "discriminator": [
        115,
        135,
        168,
        106,
        139,
        214,
        138,
        150
      ],
      "accounts": [
        {
          "name": "memberSigner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.admin",
                "account": "roscaPool"
              }
            ]
          },
          "relations": [
            "memberAccount"
          ]
        },
        {
          "name": "poolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "memberAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  98,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "memberSigner"
              }
            ]
          }
        },
        {
          "name": "memberAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "roscaMember",
      "discriminator": [
        20,
        20,
        186,
        88,
        186,
        23,
        34,
        105
      ]
    },
    {
      "name": "roscaPool",
      "discriminator": [
        182,
        198,
        190,
        210,
        206,
        123,
        232,
        60
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "poolAlreadyActive",
      "msg": "Pool is already active"
    },
    {
      "code": 6001,
      "name": "poolNotFull",
      "msg": "Pool is not yet full"
    },
    {
      "code": 6002,
      "name": "notMember",
      "msg": "You are not a registered member of this pool"
    },
    {
      "code": 6003,
      "name": "alreadyContributed",
      "msg": "Contribution already made for this cycle"
    },
    {
      "code": 6004,
      "name": "cycleNotFinished",
      "msg": "Too early to settle this cycle"
    },
    {
      "code": 6005,
      "name": "insufficientCollateral",
      "msg": "Insufficient collateral"
    },
    {
      "code": 6006,
      "name": "poolCompleted",
      "msg": "This pool is already complete"
    },
    {
      "code": 6007,
      "name": "withdrawBeforeEnd",
      "msg": "You cannot withdraw collateral before pool completion"
    },
    {
      "code": 6008,
      "name": "invalidVaultAccount",
      "msg": "Invalid vault account"
    },
    {
      "code": 6009,
      "name": "wrongCycleWindow",
      "msg": "Wrong cycle window"
    },
    {
      "code": 6010,
      "name": "invalidRecipient",
      "msg": "Invalid recipient for this cycle"
    },
    {
      "code": 6011,
      "name": "accountWriteFailed",
      "msg": "Failed to write account"
    }
  ],
  "types": [
    {
      "name": "roscaMember",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "member",
            "type": "pubkey"
          },
          {
            "name": "position",
            "type": "u8"
          },
          {
            "name": "collateralDeposited",
            "type": "u64"
          },
          {
            "name": "collateralSlashable",
            "type": "u64"
          },
          {
            "name": "totalContributed",
            "type": "u64"
          },
          {
            "name": "totalReceived",
            "type": "u64"
          },
          {
            "name": "hasReceivedPayout",
            "type": "bool"
          },
          {
            "name": "lastPaidCycle",
            "type": "i8"
          }
        ]
      }
    },
    {
      "name": "roscaPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "contributionAmount",
            "type": "u64"
          },
          {
            "name": "maxMembers",
            "type": "u8"
          },
          {
            "name": "memberCount",
            "type": "u8"
          },
          {
            "name": "cycleDuration",
            "type": "i64"
          },
          {
            "name": "startTimestamp",
            "type": "i64"
          },
          {
            "name": "currentCycle",
            "type": "u8"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
