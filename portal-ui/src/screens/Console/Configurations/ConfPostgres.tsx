// This file is part of MinIO Console Server
// Copyright (c) 2020 MinIO, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import React, { useCallback, useEffect, useState } from "react";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { FormControlLabel, Switch } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import InputBoxWrapper from "../Common/FormComponents/InputBoxWrapper/InputBoxWrapper";
import RadioGroupSelector from "../Common/FormComponents/RadioGroupSelector/RadioGroupSelector";
import SelectWrapper from "../Common/FormComponents/SelectWrapper/SelectWrapper";

interface IConfPostgresProps {
  onChange: (newValue: Map<string, string>) => void;
  classes: any;
}

const styles = (theme: Theme) => createStyles({});

const ConfPostgres = ({ onChange, classes }: IConfPostgresProps) => {
  //Local States
  const [useConnectionString, setUseConnectionString] = useState<boolean>(
    false
  );
  const [connectionString, setConnectionString] = useState<string>("");
  const [host, setHostname] = useState<string>("");
  const [dbName, setDbName] = useState<string>("");
  const [port, setPort] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [sslMode, setSslMode] = useState<string>("require");

  const [table, setTable] = useState<string>("");
  const [format, setFormat] = useState<string>("namespace");
  const [queueDir, setQueueDir] = useState<string>("");
  const [queueLimit, setQueueLimit] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  // connection_string*  (string)             Postgres server connection-string e.g. "host=localhost port=5432 dbname=minio_events user=postgres password=password sslmode=disable"

  //  "host=localhost
  // port=5432
  //dbname=minio_events
  //user=postgres
  //password=password
  //sslmode=disable"

  // table*              (string)             DB table name to store/update events, table is auto-created
  // format*             (namespace*|access)  'namespace' reflects current bucket/object list and 'access' reflects a journal of object operations, defaults to 'namespace'
  // queue_dir           (path)               staging dir for undelivered messages e.g. '/home/events'
  // queue_limit         (number)             maximum limit for undelivered messages, defaults to '10000'
  // comment             (sentence)           optionally add a comment to this setting

  const KvSeparator = "=";
  const parseConnectionString = (
    input: string,
    keys: string[]
  ): Map<string, string> => {
    let valueIndexes: number[] = [];

    for (const key of keys) {
      const i = input.indexOf(key + KvSeparator);
      if (i === -1) {
        continue;
      }
      valueIndexes.push(i);
    }
    valueIndexes.sort((n1, n2) => n1 - n2);

    let kvFields = new Map<string, string>();
    let fields: string[] = new Array<string>(valueIndexes.length);
    for (let i = 0; i < valueIndexes.length; i++) {
      const j = i + 1;
      if (j < valueIndexes.length) {
        fields[i] = input.substr(
          valueIndexes[i],
          valueIndexes[j] - valueIndexes[i]
        );
      } else {
        fields[i] = input.substr(valueIndexes[i]);
      }
    }

    for (let field of fields) {
      if (field === undefined) {
        continue;
      }
      const key = field.substr(0, field.indexOf("="));
      const value = field.substr(field.indexOf("=") + 1).trim();
      kvFields.set(key, value);
    }
    return kvFields;
  };

  const configToString = useCallback((): string => {
    let strValue = "";
    if (host !== "") {
      strValue = `${strValue} host=${host}`;
    }
    if (dbName !== "") {
      strValue = `${strValue} dbname=${dbName}`;
    }
    if (user !== "") {
      strValue = `${strValue} user=${user}`;
    }
    if (password !== "") {
      strValue = `${strValue} password=${password}`;
    }
    if (port !== "") {
      strValue = `${strValue} port=${port}`;
    }

    strValue = `${strValue} sslmode=${sslMode}`;

    return strValue.trim();
  }, [host, dbName, user, password, port, sslMode]);

  useEffect(() => {
    if (connectionString !== "") {
      let values: Map<string, string> = new Map();

      if (connectionString !== "") {
        values.set("connection_string", connectionString);
      }
      if (table !== "") {
        values.set("table", table);
      }

      if (format !== "") {
        values.set("format", format);
      }

      if (queueDir !== "") {
        values.set("queue_dir", queueDir);
      }

      if (queueLimit !== "") {
        values.set("queue_limit", queueLimit);
      }

      if (comment !== "") {
        values.set("comment", comment);
      }

      onChange(values);
    }
  }, [
    connectionString,
    table,
    format,
    queueDir,
    queueLimit,
    comment,
    onChange
  ]);

  useEffect(() => {
    const cs = configToString();
    setConnectionString(cs);
  }, [
    user,
    dbName,
    password,
    port,
    sslMode,
    host,
    setConnectionString,
    configToString
  ]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={useConnectionString}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                if (event.target.checked) {
                  // build connection_string
                  const cs = configToString();
                  setConnectionString(cs);
                } else {
                  // parse connection_string
                  const kv = parseConnectionString(connectionString, [
                    "host",
                    "port",
                    "dbname",
                    "user",
                    "password",
                    "sslmode"
                  ]);
                  setHostname(kv.get("host") ? kv.get("host") + "" : "");
                  setPort(kv.get("port") ? kv.get("port") + "" : "");
                  setDbName(kv.get("dbname") ? kv.get("dbname") + "" : "");
                  setUser(kv.get("user") ? kv.get("user") + "" : "");
                  setPassword(
                    kv.get("password") ? kv.get("password") + "" : ""
                  );
                  setSslMode(
                    kv.get("sslmode") ? kv.get("sslmode") + "" : "require"
                  );
                }

                setUseConnectionString(event.target.checked);
              }}
              name="checkedB"
              color="primary"
            />
          }
          label="Enter Connection String"
        />
      </Grid>
      {useConnectionString ? (
        <React.Fragment>
          <Grid item xs={12}>
            <InputBoxWrapper
              id="connection-string"
              name="connection_string"
              label="Connection String"
              value={connectionString}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setConnectionString(e.target.value);
              }}
            />
          </Grid>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Grid item xs={12}>
            <InputBoxWrapper
              id="host"
              name="host"
              label="Host"
              value={host}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setHostname(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <InputBoxWrapper
              id="db-name"
              name="db-name"
              label="DB Name"
              value={dbName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDbName(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <InputBoxWrapper
              id="port"
              name="port"
              label="Port"
              value={port}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPort(e.target.value);
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <SelectWrapper
              value={sslMode}
              label="SSL Mode"
              id="sslmode"
              name="sslmode"
              onChange={(e): void => {
                if (e.target.value !== undefined) {
                  setSslMode(e.target.value + "");
                }
              }}
              options={[
                { label: "Require", value: "require" },
                { label: "Disable", value: "disable" },
                { label: "Verify CA", value: "verify-ca" },
                { label: "Verify Full", value: "verify-full" }
              ]}
            />
          </Grid>
          <Grid item xs={12}>
            <InputBoxWrapper
              id="user"
              name="user"
              label="User"
              value={user}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUser(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <InputBoxWrapper
              id="password"
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
              }}
            />
          </Grid>
        </React.Fragment>
      )}
      <Grid item xs={12}>
        <InputBoxWrapper
          id="table"
          name="table"
          label="Table"
          value={table}
          tooltip="DB table name to store/update events, table is auto-created"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTable(e.target.value);
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <RadioGroupSelector
          currentSelection={format}
          id="format"
          name="format"
          label="Format"
          onChange={e => {
            setFormat(e.target.value);
          }}
          tooltip="'namespace' reflects current bucket/object list and 'access' reflects a journal of object operations, defaults to 'namespace'"
          selectorOptions={[
            { label: "Namespace", value: "namespace" },
            { label: "Access", value: "access" }
          ]}
        />
      </Grid>
      <Grid item xs={12}>
        <InputBoxWrapper
          id="queue-dir"
          name="queue_dir"
          label="Queue Dir"
          value={queueDir}
          tooltip="staging dir for undelivered messages e.g. '/home/events'"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQueueDir(e.target.value);
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <InputBoxWrapper
          id="queue-limit"
          name="queue_limit"
          label="Queue Limit"
          type="number"
          value={queueLimit}
          tooltip="maximum limit for undelivered messages, defaults to '10000'"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQueueLimit(e.target.value);
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <InputBoxWrapper
          id="comment"
          name="comment"
          label="Comment"
          multiline={true}
          value={comment}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setComment(e.target.value);
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <br />
      </Grid>
      <Grid item xs={12}>
        <br />
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(ConfPostgres);
